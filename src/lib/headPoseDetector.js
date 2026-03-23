const DEFAULT_OPTIONS = {
  samplingMs: 300,
  consecutiveDownFrames: 2,
  confidenceMargin: 0.08
}

const HEAD_POSE_CANDIDATES = [
  "a person looking down at a keyboard",
  "a person looking straight ahead",
  "a person looking up"
]

export class HeadPoseDetector {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.status = "unknown"
    this.listeners = new Set()
    this.stream = null
    this.videoEl = null
    this.canvasEl = null
    this.ctx = null
    this.timer = null
    this.pipeline = null
    this.isStarting = false
    this.downFrames = 0
  }

  subscribe(cb) {
    this.listeners.add(cb)
    cb(this.status)
    return () => this.listeners.delete(cb)
  }

  getStatus() {
    return this.status
  }

  setStatus(nextStatus) {
    if (this.status === nextStatus) return
    this.status = nextStatus
    this.listeners.forEach((cb) => {
      try {
        cb(nextStatus)
      } catch {
        // Keep detector alive if a listener throws.
      }
    })
  }

  async ensurePipeline() {
    if (this.pipeline) return this.pipeline

    const { pipeline, env } = await import("@huggingface/transformers")
    env.allowLocalModels = false

    this.pipeline = await pipeline(
      "zero-shot-image-classification",
      "Xenova/clip-vit-base-patch32",
      { quantized: true }
    )
    return this.pipeline
  }

  async start() {
    if (this.timer || this.isStarting) return
    this.isStarting = true

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is unavailable in this browser.")
      }

      // Request camera permission first so users immediately see the browser prompt.
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })

      this.videoEl = document.createElement("video")
      this.videoEl.srcObject = this.stream
      this.videoEl.playsInline = true
      this.videoEl.muted = true
      await this.videoEl.play()

      // Load model after permission is granted to avoid silent waiting.
      await this.ensurePipeline()

      this.canvasEl = document.createElement("canvas")
      this.canvasEl.width = 224
      this.canvasEl.height = 224
      this.ctx = this.canvasEl.getContext("2d")

      this.timer = window.setInterval(() => {
        this.detectOnce().catch(() => {
          this.setStatus("unknown")
        })
      }, this.options.samplingMs)
    } catch (error) {
      await this.stop()
      throw error
    } finally {
      this.isStarting = false
    }
  }

  async detectOnce() {
    if (!this.pipeline || !this.videoEl || !this.ctx || this.videoEl.readyState < 2) return

    this.ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height)
    const predictions = await this.pipeline(this.canvasEl, HEAD_POSE_CANDIDATES)

    const byLabel = new Map(predictions.map((item) => [item.label, item.score]))
    const downScore = byLabel.get(HEAD_POSE_CANDIDATES[0]) || 0
    const upScore = byLabel.get(HEAD_POSE_CANDIDATES[1]) || 0
    const aboveScore = byLabel.get(HEAD_POSE_CANDIDATES[2]) || 0

    const downWins =
      downScore > upScore + this.options.confidenceMargin &&
      downScore > aboveScore + this.options.confidenceMargin

    if (downWins) {
      this.downFrames += 1
      if (this.downFrames >= this.options.consecutiveDownFrames) {
        this.setStatus("down")
      }
      return
    }

    this.downFrames = 0
    this.setStatus("up")
  }

  async stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.videoEl) {
      try {
        this.videoEl.pause()
      } catch {
        // no-op
      }
      this.videoEl.srcObject = null
      this.videoEl = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    this.canvasEl = null
    this.ctx = null
    this.downFrames = 0
    this.setStatus("unknown")
  }
}
