import React, { useState, useEffect } from "react"
import { Play, RotateCcw } from "lucide-react"
import { useStore } from "../store.js"
import { formatDuration } from "../utils.js"
import { useTranslation } from "react-i18next"
import { formatShortcut } from "../utils/shortcuts.js"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    if (practiceState.isActive) {
      const interval = setInterval(() => {
        const now = Date.now()
        const actualElapsed = now - practiceState.startTime
        setElapsedTime(actualElapsed)
      }, 100)

      setTimer(interval)

      return () => clearInterval(interval)
    } else {
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }
    }
  }, [practiceState.isActive, practiceState.startTime])

  useEffect(() => {
    if (
      practiceState.currentIndex >= currentArticle?.content.length &&
      practiceState.isActive
    ) {
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }
    }
  }, [practiceState.currentIndex, currentArticle, practiceState.isActive, timer])

  const handleStart = () => {
    if (currentArticle) {
      setElapsedTime(0)
      useStore.getState().startPractice(currentArticle, practiceState.mode)
    }
  }

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
            </div>

            <div className="text-center sm:text-left">
              <div className="font-mono text-2xl font-bold text-primary">
                {formatDuration(elapsedTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("results.elapsed-time")}
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
              size="sm"
              className="h-9 gap-1.5 px-4"
              disabled={practiceState.isActive}
              onClick={handleStart}
            >
              <Play className="size-4" />
              {practiceState.isActive
                ? t("practice-control.practicing")
                : t("practice-control.restart")}
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

        <div className="text-xs text-muted-foreground">
          <span>{t("practice-control.keyboard-shortcuts")}</span>
          <span className="mx-2">
            {formatShortcut(settings?.shortcuts?.startPractice) ||
              t("practice-control.space-start")}
          </span>
          <span className="mx-2">
            {formatShortcut(settings?.shortcuts?.exitPractice) ||
              t("practice-control.esc-exit")}
          </span>
          <span className="mx-2">
            {formatShortcut(settings?.shortcuts?.restartPractice) ||
              t("practice-control.ctrl-enter-restart")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default PracticeControl
