import React from "react"
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  RotateCcw,
  ArrowRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store.js"
import { formatDuration, formatWPM } from "../utils.js"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const ResultsPanel = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentArticle, records, startPractice } = useStore()

  if (!currentArticle) return null

  const articleRecords = records[`typer.records:${currentArticle.id}`] || []
  const latestRecord = articleRecords[articleRecords.length - 1]

  if (!latestRecord) return null

  const getBestRecord = () => {
    return articleRecords.reduce(
      (best, current) => (current.wpm > best.wpm ? current : best),
      articleRecords[0]
    )
  }

  const getAverageWPM = () => {
    const total = articleRecords.reduce((sum, record) => sum + record.wpm, 0)
    return Math.round(total / articleRecords.length)
  }

  const getImprovement = () => {
    if (articleRecords.length < 2) return 0
    const previous = articleRecords[articleRecords.length - 2]
    return latestRecord.wpm - previous.wpm
  }

  const handlePracticeAgain = () => {
    startPractice(currentArticle)
  }

  const handleViewHistory = () => {
    navigate("/history")
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return "text-green-600 dark:text-green-400"
    if (accuracy >= 85) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getWPMColor = (wpm) => {
    if (wpm >= 60) return "text-green-600 dark:text-green-400"
    if (wpm >= 40) return "text-yellow-600 dark:text-yellow-400"
    if (wpm >= 20) return "text-blue-600 dark:text-blue-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">{t("results.practice-completed")}</CardTitle>
        <CardDescription>{t("results.practice-completed-subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div
              className={`text-4xl font-bold ${getWPMColor(latestRecord.wpm)}`}
            >
              {formatWPM(latestRecord.wpm)}
            </div>
            <div className="font-medium text-blue-600 dark:text-blue-400">
              {t("results.wpm")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("results.wpm-description")}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 text-center dark:from-green-900/20 dark:to-green-800/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div
              className={`text-4xl font-bold ${getAccuracyColor(latestRecord.accuracy * 100)}`}
            >
              {Math.round(latestRecord.accuracy * 100)}%
            </div>
            <div className="font-medium text-green-600 dark:text-green-400">
              {t("results.accuracy")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("results.accuracy-description")}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {formatDuration(latestRecord.durationMs)}
            </div>
            <div className="font-medium text-purple-600 dark:text-purple-400">
              {t("results.elapsed-time")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("results.elapsed-time-description")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                {t("results.detailed-stats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("results.cpm")}</span>
                <span className="font-mono font-semibold">{latestRecord.cpm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.total-keystrokes")}
                </span>
                <span className="font-mono font-semibold">
                  {latestRecord.totalKeystrokes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.backspaces")}
                </span>
                <span className="font-mono font-semibold">
                  {latestRecord.backspaces}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.error-count")}
                </span>
                <span className="font-mono font-semibold">
                  {latestRecord.errors.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.practice-mode")}
                </span>
                <span className="font-semibold">
                  {latestRecord.mode === "strict"
                    ? t("results.strict-mode")
                    : t("results.lenient-mode")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("results.history-comparison")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.current-score")}
                </span>
                <span className="font-mono font-semibold text-primary">
                  {formatWPM(latestRecord.wpm)} WPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.best-record")}
                </span>
                <span className="font-mono font-semibold text-yellow-600 dark:text-yellow-400">
                  {formatWPM(getBestRecord().wpm)} WPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.average-score")}
                </span>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {formatWPM(getAverageWPM())} WPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("results.practice-count")}
                </span>
                <span className="font-semibold">{articleRecords.length}</span>
              </div>
              {articleRecords.length >= 2 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("results.compared-to-last")}
                  </span>
                  <span
                    className={`font-semibold ${getImprovement() >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {getImprovement() >= 0 ? "+" : ""}
                    {getImprovement()} WPM
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 text-base"
            onClick={handlePracticeAgain}
          >
            <RotateCcw className="h-5 w-5" />
            {t("results.practice-again")}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 text-base"
            onClick={handleViewHistory}
          >
            <ArrowRight className="h-5 w-5" />
            {t("results.view-history")}
          </Button>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 text-center dark:from-blue-900/20 dark:to-purple-900/20">
          <p className="text-foreground">
            {latestRecord.wpm >= 60
              ? t("results.encouragement-excellent")
              : latestRecord.wpm >= 40
                ? t("results.encouragement-good")
                : t("results.encouragement-start")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("results.practice-suggestion")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResultsPanel
