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

const EMPTY_SCORES = {
  down: 0,
  forward: 0,
  up: 0
}

export class HeadPoseDetector {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.status = "unknown"
    this.listeners = new Set()
    this.debugListeners = new Set()
    this.stream = null
    this.videoEl = null
    this.canvasEl = null
    this.ctx = null
    this.timer = null
    this.pipeline = null
    this.isStarting = false
    this.isDetecting = false
    this.downFrames = 0
    this.debugState = this.createDebugState()
  }

  createDebugState() {
    return {
      status: this.status,
      scores: { ...EMPTY_SCORES },
      predictions: [],
      isCameraReady: false,
      isModelReady: false,
      lastUpdatedAt: null,
      error: ""
    }
  }

  subscribe(cb) {
    this.listeners.add(cb)
    cb(this.status)
    return () => this.listeners.delete(cb)
  }

  subscribeDebug(cb) {
    this.debugListeners.add(cb)
    cb(this.debugState)
    return () => this.debugListeners.delete(cb)
  }

  getStatus() {
    return this.status
  }

  getStream() {
    return this.stream
  }

  getDebugState() {
    return this.debugState
  }

  emitDebugState() {
    this.debugListeners.forEach((cb) => {
      try {
        cb(this.debugState)
      } catch {
        // Keep detector alive if a debug listener throws.
      }
    })
  }

  setStatus(nextStatus, debugPatch = null) {
    const didStatusChange = this.status !== nextStatus
    this.status = nextStatus

    if (debugPatch || this.debugState.status !== nextStatus) {
      this.debugState = {
        ...this.debugState,
        ...(debugPatch || {}),
        status: nextStatus,
        scores: debugPatch?.scores
          ? { ...EMPTY_SCORES, ...debugPatch.scores }
          : this.debugState.scores
      }
      this.emitDebugState()
    }

    if (!didStatusChange) return

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
      this.setStatus(this.status, {
        isCameraReady: true,
        error: ""
      })

      this.videoEl = document.createElement("video")
      this.videoEl.srcObject = this.stream
      this.videoEl.playsInline = true
      this.videoEl.muted = true
      await this.videoEl.play()

      // Load model after permission is granted to avoid silent waiting.
      await this.ensurePipeline()
      this.setStatus(this.status, {
        isModelReady: true,
        error: ""
      })

      this.canvasEl = document.createElement("canvas")
      this.canvasEl.width = 224
      this.canvasEl.height = 224
      this.ctx = this.canvasEl.getContext("2d")

      await this.detectOnce().catch(() => {
        this.setStatus("unknown")
      })

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
    if (
      this.isDetecting ||
      !this.pipeline ||
      !this.videoEl ||
      !this.ctx ||
      this.videoEl.readyState < 2
    ) {
      return
    }

    this.isDetecting = true

    try {
      this.ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height)
      const predictions = await this.pipeline(this.canvasEl, HEAD_POSE_CANDIDATES)

      const byLabel = new Map(predictions.map((item) => [item.label, item.score]))
      const downScore = byLabel.get(HEAD_POSE_CANDIDATES[0]) || 0
      const forwardScore = byLabel.get(HEAD_POSE_CANDIDATES[1]) || 0
      const upScore = byLabel.get(HEAD_POSE_CANDIDATES[2]) || 0

      const downWins =
        downScore > forwardScore + this.options.confidenceMargin &&
        downScore > upScore + this.options.confidenceMargin

      const nextScores = {
        down: downScore,
        forward: forwardScore,
        up: upScore
      }

      if (downWins) {
        this.downFrames += 1
        if (this.downFrames >= this.options.consecutiveDownFrames) {
          this.setStatus("down", {
            scores: nextScores,
            predictions,
            isCameraReady: true,
            isModelReady: true,
            lastUpdatedAt: Date.now(),
            error: ""
          })
        } else {
          this.setStatus(this.status, {
            scores: nextScores,
            predictions,
            isCameraReady: true,
            isModelReady: true,
            lastUpdatedAt: Date.now(),
            error: ""
          })
        }
        return
      }

      this.downFrames = 0
      this.setStatus("up", {
        scores: nextScores,
        predictions,
        isCameraReady: true,
        isModelReady: true,
        lastUpdatedAt: Date.now(),
        error: ""
      })
    } finally {
      this.isDetecting = false
    }
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
    this.isDetecting = false
    this.downFrames = 0
    this.setStatus("unknown", this.createDebugState())
  }
}
