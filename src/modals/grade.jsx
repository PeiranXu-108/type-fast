import React from "react"
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  ArrowLeft,
  RotateCcw,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import HexBadge from "@/components/scifi/HexBadge.jsx"
import HudStat from "@/components/scifi/HudStat.jsx"

export default function Grade({
  wpm,
  cpm,
  duration,
  accuracy,
  onReturn,
  onPracticeAgain,
}) {
  const { t } = useTranslation()
  const getGrade = (wpmValue) => {
    if (wpmValue >= 60)
      return {
        grade: "A+",
        color: "text-neon-green",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-green)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-green)_12%,var(--surface))]",
      }
    if (wpmValue >= 50)
      return {
        grade: "A",
        color: "text-neon-green",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-green)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-green)_12%,var(--surface))]",
      }
    if (wpmValue >= 40)
      return {
        grade: "B+",
        color: "text-neon-info",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-info)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-info)_12%,var(--surface))]",
      }
    if (wpmValue >= 35)
      return {
        grade: "B",
        color: "text-neon-info",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-info)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-info)_12%,var(--surface))]",
      }
    if (wpmValue >= 30)
      return {
        grade: "C+",
        color: "text-neon-amber",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-amber)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-amber)_12%,var(--surface))]",
      }
    if (wpmValue >= 25)
      return {
        grade: "C",
        color: "text-neon-amber",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-amber)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-amber)_12%,var(--surface))]",
      }
    if (wpmValue >= 20)
      return {
        grade: "D",
        color: "text-neon-orange",
        bgColor: "[--line:color-mix(in_oklch,var(--neon-orange)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-orange)_12%,var(--surface))]",
      }
    return {
      grade: "F",
      color: "text-neon-red",
      bgColor: "[--line:color-mix(in_oklch,var(--neon-red)_65%,transparent)] [--fill:color-mix(in_oklch,var(--neon-red)_12%,var(--surface))]",
    }
  }

  const gradeInfo = getGrade(wpm)
  const tile =
    "hud-corners relative border border-hud-line/60 bg-background/40 p-4 [--hud-corner-size:8px]"

  return (
    <Dialog open onOpenChange={(next) => !next && onReturn()}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              aria-hidden="true"
              className="hud-label flex items-center gap-2 !text-neon-green"
            >
              <span className="hud-led animate-hud-pulse" />
              SESSION // COMPLETE
            </div>
            <HexBadge className={cn("size-20", gradeInfo.color)} fillOpacity={0.14}>
              <Trophy className="h-9 w-9" />
            </HexBadge>
            <div className="space-y-3">
              <DialogTitle className="text-xl">
                {t("results.practice-completed")}
              </DialogTitle>
              <div
                className={cn(
                  "hud-chamfer-outline inline-flex items-center gap-3 px-6 py-1.5 [--cut:10px]",
                  gradeInfo.bgColor
                )}
              >
                <span aria-hidden="true" className="hud-label">
                  RANK
                </span>
                <span className={cn("neon-text font-display text-3xl font-black leading-none", gradeInfo.color)}>
                  {gradeInfo.grade}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className={tile}>
            <HudStat label="WPM" value={wpm} tone="info" icon={TrendingUp} align="center" />
          </div>
          <div className={tile}>
            <HudStat label="CPM" value={cpm} tone="green" icon={TrendingUp} align="center" />
          </div>
          <div className={tile}>
            <HudStat
              label={t("results.elapsed-time")}
              value={duration}
              tone="violet"
              icon={Clock}
              size="sm"
              align="center"
            />
          </div>
          <div className={tile}>
            <HudStat
              label={t("results.accuracy")}
              value={`${accuracy}%`}
              tone="orange"
              icon={Target}
              size="sm"
              align="center"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:grid sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onReturn}
          >
            <ArrowLeft className="mr-2 size-4" />
            {t("results.return")}
          </Button>
          <Button type="button" className="w-full" onClick={onPracticeAgain}>
            <RotateCcw className="mr-2 size-4" />
            {t("results.practice-again")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
