import React, { useState, useEffect, useRef } from "react"
import { RotateCcw } from "lucide-react"
import { useStore } from "../store.js"
import { formatDuration, calculateCPM, calculateAccuracy, calculateWPMFromText } from "../utils.js"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
    <Card className="sticky top-20 z-40 bg-card/95 backdrop-blur-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div>
              <h3 className="font-semibold text-foreground">
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
              <div className="text-center sm:text-left">
                <div className="font-mono text-2xl font-bold text-primary">
                  {formatDuration(elapsedTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("results.elapsed-time")}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 border-l border-border pl-4 sm:gap-6 sm:pl-6">
                <div className="text-center sm:text-left">
                  <div className="text-lg font-bold text-primary">
                    {formatMetric(liveStats.wpm)}
                  </div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatMetric(liveStats.cpm)}
                  </div>
                  <div className="text-xs text-muted-foreground">CPM</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {liveStats.accuracy}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("results.accuracy")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9",
                practiceState.mode === "strict"
                  ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
                  : "border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:text-green-200 dark:hover:bg-green-900"
              )}
              onClick={handleModeToggle}
              title={
                practiceState.mode === "strict"
                  ? t("practice-control.strict-mode-description")
                  : t("practice-control.lenient-mode-description")
              }
            >
              {practiceState.mode === "strict"
                ? t("practice-control.strict")
                : t("practice-control.lenient")}
            </Button>

            <Button
              type="button"
              variant="secondary"
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
              className="h-9"
              onClick={handleStop}
              title={t("practice-control.stop-practice")}
            >
              {t("practice-control.exit")}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>{t("practice-control.progress")}</span>
            <span>
              {Math.round(
                (practiceState.currentIndex / currentArticle.content.length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300 ease-out"
              style={{
                width: `${(practiceState.currentIndex / currentArticle.content.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PracticeControl
