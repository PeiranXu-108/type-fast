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
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      }
    if (wpmValue >= 50)
      return {
        grade: "A",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      }
    if (wpmValue >= 40)
      return {
        grade: "B+",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
      }
    if (wpmValue >= 35)
      return {
        grade: "B",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
      }
    if (wpmValue >= 30)
      return {
        grade: "C+",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      }
    if (wpmValue >= 25)
      return {
        grade: "C",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      }
    if (wpmValue >= 20)
      return {
        grade: "D",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
      }
    return {
      grade: "F",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    }
  }

  const gradeInfo = getGrade(wpm)

  return (
    <Dialog open onOpenChange={(next) => !next && onReturn()}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full",
                gradeInfo.bgColor
              )}
            >
              <Trophy className={cn("h-10 w-10", gradeInfo.color)} />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl">
                {t("results.practice-completed")}
              </DialogTitle>
              <div
                className={cn(
                  "inline-flex rounded-full px-4 py-2",
                  gradeInfo.bgColor
                )}
              >
                <span className={cn("text-2xl font-bold", gradeInfo.color)}>
                  {gradeInfo.grade}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                WPM
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {wpm}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                CPM
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cpm}
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {t("results.elapsed-time")}
              </span>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {duration}
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {t("results.accuracy")}
              </span>
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {accuracy}%
            </div>
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
