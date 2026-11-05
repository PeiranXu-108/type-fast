import React, { useState, useEffect, useRef } from "react"
import { RotateCcw, LogOut } from "lucide-react"
import { useStore } from "../store.js"
import { formatDuration, calculateCPM, calculateAccuracy, calculateWPMFromText } from "../utils.js"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import HudStat from "./scifi/HudStat.jsx"

const formatMetric = (value) => Number(value || 0).toFixed(2)

const PracticeControl = () => {
  const { t } = useTranslation()
  const {
    currentArticle,
    practiceState,
    settings,
    updatePracticeState,
    stopPractice,
  } = useStore()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [liveStats, setLiveStats] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100,
  })
  const timerRef = useRef(null)
  const statsIntervalRef = useRef(null)

  const practiceStartTime = practiceState.startTime || 0

  useEffect(() => {
    if (practiceState.isActive && practiceState.startTime > 0) {
      const interval = setInterval(() => {
        const now = Date.now()
        const actualElapsed = now - practiceState.startTime
        setElapsedTime(actualElapsed)
      }, 100)

      timerRef.current = interval

      return () => clearInterval(interval)
    } else {
      setElapsedTime(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [practiceState.isActive, practiceState.startTime])

  useEffect(() => {
    if (
      practiceState.currentIndex >= currentArticle?.content.length &&
      practiceState.isActive
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [practiceState.currentIndex, currentArticle, practiceState.isActive])

  useEffect(() => {
    if (
      !practiceState.isActive ||
      practiceStartTime <= 0 ||
      !currentArticle ||
      practiceState.currentIndex >= currentArticle.content.length
    ) {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
      if (!practiceState.isActive) {
        setLiveStats({ wpm: 0, cpm: 0, accuracy: 100 })
      }
      return
    }

    statsIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - practiceStartTime
      if (elapsed <= 0) return

      const wpm = calculateWPMFromText(
        currentArticle.content,
        practiceState.currentIndex,
        elapsed
      )
      const cpm = calculateCPM(practiceState.currentIndex, elapsed)

      let accuracy
      if (practiceState.mode === "strict") {
        const sme = practiceState.strictModeErrors || []
        const totalTyped = practiceState.currentIndex + sme.length
        const correctChars = practiceState.currentIndex
        accuracy =
          totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100
      } else {
        const correctChars =
          practiceState.currentIndex - practiceState.errors.length
        accuracy = calculateAccuracy(correctChars, practiceState.keystrokes)
      }

      setLiveStats({ wpm, cpm, accuracy })
    }, 100)

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
    }
  }, [
    currentArticle,
    practiceState.isActive,
    practiceStartTime,
    practiceState.currentIndex,
    practiceState.keystrokes,
    practiceState.mode,
    practiceState.errors.length,
    practiceState.strictModeErrors,
  ])

  const handleRestart = () => {
    if (currentArticle) {
      setElapsedTime(0)
      useStore.getState().startPractice(currentArticle, practiceState.mode)
    }
  }

  const handleModeToggle = () => {
    const newMode = practiceState.mode === "lenient" ? "strict" : "lenient"
    updatePracticeState({ mode: newMode })
  }

  const handleStop = () => {
    stopPractice()
    setElapsedTime(0)
  }

  if (!currentArticle) return null

  return (
    <Card className="sticky top-20 z-40 gap-0 bg-popover/80 py-0 backdrop-blur-xl">
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 sm:max-w-[16rem]">
              <div
                aria-hidden="true"
                className="hud-label mb-1.5 flex items-center gap-1.5 !text-primary"
              >
                <span className="hud-led animate-hud-pulse" />
                LIVE // TELEMETRY
              </div>
              <h3
                className="truncate font-display font-semibold tracking-wide text-foreground"
                title={currentArticle.title}
              >
                {currentArticle.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentArticle.wordCount} {t("word")} •{" "}
                {practiceState.mode === "lenient"
                  ? t("practice-control.lenient-mode")
                  : t("practice-control.strict-mode")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("practice-control.headpose-training")}:{" "}
                {settings?.headPoseTraining?.enabled
                  ? t("practice-control.headpose-status-checking")
                  : t("practice-control.headpose-status-disabled")}
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-4 sm:gap-6">
              <HudStat
                label={t("results.elapsed-time")}
                value={formatDuration(elapsedTime)}
                size="lg"
                className="min-w-[9.5rem] text-center sm:text-left"
              />
              <div className="grid grid-cols-3 gap-3 border-l border-hud-line pl-4 sm:gap-6 sm:pl-6">
                <HudStat
                  label="WPM"
                  value={formatMetric(liveStats.wpm)}
                  size="sm"
                  className="min-w-[5.5rem] text-center sm:text-left"
                />
                <HudStat
                  label="CPM"
                  value={formatMetric(liveStats.cpm)}
                  tone="info"
                  size="sm"
                  className="min-w-[6.5rem] text-center sm:text-left"
                />
                <HudStat
                  label={t("results.accuracy")}
                  value={`${liveStats.accuracy}%`}
                  tone="green"
                  size="sm"
                  className="min-w-[5rem] text-center sm:text-left"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-2 font-semibold",
                practiceState.mode === "strict"
                  ? "border-neon-red/60 bg-neon-red/10 text-neon-red hover:border-neon-red hover:bg-neon-red/20"
                  : "border-neon-green/60 bg-neon-green/10 text-neon-green hover:border-neon-green hover:bg-neon-green/20"
              )}
              onClick={handleModeToggle}
              title={
                practiceState.mode === "strict"
                  ? t("practice-control.strict-mode-description")
                  : t("practice-control.lenient-mode-description")
              }
            >
              <span className="hud-led" aria-hidden="true" />
              {practiceState.mode === "strict"
                ? t("practice-control.strict")
                : t("practice-control.lenient")}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleRestart}
              title={t("restart-practice")}
            >
              <RotateCcw className="size-4" />
              {t("practice-control.restart")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleStop}
              title={t("practice-control.stop-practice")}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("practice-control.exit")}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm text-muted-foreground">
            <span className="hud-label">{t("practice-control.progress")}</span>
            <span className="font-mono text-xs text-primary">
              {Math.round(
                (practiceState.currentIndex / currentArticle.content.length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden border border-hud-line/70 bg-background/50">
            <div
              className="relative h-full bg-gradient-to-r from-primary/30 to-primary shadow-[0_0_14px_var(--primary)] transition-all duration-300 ease-out"
              style={{
                width: `${(practiceState.currentIndex / currentArticle.content.length) * 100}%`,
              }}
            >
              <span className="absolute inset-y-0 right-0 w-[3px] bg-white/90 shadow-[0_0_8px_white]" />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), var(--hud-line) calc(10% - 1px) 10%)",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PracticeControl
