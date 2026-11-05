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
import { cn } from "@/lib/utils"
import RingGauge from "./scifi/RingGauge.jsx"
import HexBadge from "./scifi/HexBadge.jsx"
import { TONE_TEXT } from "./scifi/tones.js"

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

  const getAccuracyTone = (accuracy) => {
    if (accuracy >= 95) return "green"
    if (accuracy >= 85) return "amber"
    return "red"
  }

  const getWPMTone = (wpm) => {
    if (wpm >= 60) return "green"
    if (wpm >= 40) return "amber"
    if (wpm >= 20) return "info"
    return "red"
  }

  const dataRow = "flex items-center justify-between border-b border-hud-line/40 pb-2 last:border-0 last:pb-0"

  return (
    <Card>
      <CardHeader className="text-center">
        <div
          aria-hidden="true"
          className="hud-label mb-1 flex items-center justify-center gap-2 !text-neon-green"
        >
          <span className="hud-led animate-hud-pulse" />
          MISSION // COMPLETE
        </div>
        <CardTitle className="text-3xl">{t("results.practice-completed")}</CardTitle>
        <CardDescription>{t("results.practice-completed-subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="hud-corners relative flex flex-col items-center border border-hud-line/60 bg-background/30 p-6 text-center">
            <Trophy aria-hidden="true" className={cn("mb-2 h-5 w-5", TONE_TEXT[getWPMTone(latestRecord.wpm)])} />
            <RingGauge
              value={latestRecord.wpm}
              max={Math.max(100, latestRecord.wpm)}
              display={formatWPM(latestRecord.wpm)}
              label={t("results.wpm")}
              tone={getWPMTone(latestRecord.wpm)}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {t("results.wpm-description")}
            </div>
          </div>

          <div className="hud-corners relative flex flex-col items-center border border-hud-line/60 bg-background/30 p-6 text-center">
            <Target aria-hidden="true" className={cn("mb-2 h-5 w-5", TONE_TEXT[getAccuracyTone(latestRecord.accuracy * 100)])} />
            <RingGauge
              value={latestRecord.accuracy * 100}
              max={100}
              display={`${Math.round(latestRecord.accuracy * 100)}%`}
              label={t("results.accuracy")}
              tone={getAccuracyTone(latestRecord.accuracy * 100)}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {t("results.accuracy-description")}
            </div>
          </div>

          <div className="hud-corners relative flex flex-col items-center justify-center border border-hud-line/60 bg-background/30 p-6 text-center">
            <HexBadge className="mb-4 size-16 text-neon-violet">
              <Clock className="h-7 w-7" />
            </HexBadge>
            <div className="neon-text font-display text-4xl font-bold tabular-nums text-neon-violet">
              {formatDuration(latestRecord.durationMs)}
            </div>
            <div className="hud-label mt-2 !text-neon-violet">
              {t("results.elapsed-time")}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t("results.elapsed-time-description")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="bg-background/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-neon-green" />
                {t("results.detailed-stats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-sm">
              <div className={dataRow}>
                <span className="text-muted-foreground">{t("results.cpm")}</span>
                <span className="font-semibold">{latestRecord.cpm}</span>
              </div>
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.total-keystrokes")}
                </span>
                <span className="font-semibold">
                  {latestRecord.totalKeystrokes}
                </span>
              </div>
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.backspaces")}
                </span>
                <span className="font-semibold">
                  {latestRecord.backspaces}
                </span>
              </div>
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.error-count")}
                </span>
                <span className="font-semibold">
                  {latestRecord.errors.length}
                </span>
              </div>
              <div className={dataRow}>
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

          <Card className="bg-background/30">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("results.history-comparison")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-sm">
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.current-score")}
                </span>
                <span className="font-semibold text-primary">
                  {formatWPM(latestRecord.wpm)} WPM
                </span>
              </div>
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.best-record")}
                </span>
                <span className="font-semibold text-neon-amber">
                  {formatWPM(getBestRecord().wpm)} WPM
                </span>
              </div>
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.average-score")}
                </span>
                <span className="font-semibold text-neon-info">
                  {formatWPM(getAverageWPM())} WPM
                </span>
              </div>
              <div className={dataRow}>
                <span className="text-muted-foreground">
                  {t("results.practice-count")}
                </span>
                <span className="font-semibold">{articleRecords.length}</span>
              </div>
              {articleRecords.length >= 2 && (
                <div className={dataRow}>
                  <span className="text-muted-foreground">
                    {t("results.compared-to-last")}
                  </span>
                  <span
                    className={`font-semibold ${getImprovement() >= 0 ? "text-neon-green" : "text-neon-red"}`}
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
            variant="outline"
            className="gap-2 text-base"
            onClick={handleViewHistory}
          >
            <ArrowRight className="h-5 w-5" />
            {t("results.view-history")}
          </Button>
        </div>

        <div className="border-l-2 border-primary bg-gradient-to-r from-primary/10 via-neon-violet/5 to-transparent p-4 text-center">
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
