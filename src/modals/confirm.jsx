import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FileText, Play } from "lucide-react"
import { useStore } from "../store.js"
import { matchesShortcut } from "../utils/shortcuts.js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import HexBadge from "@/components/scifi/HexBadge.jsx"

export default function Confirm({ title, onConfirm, onCancel }) {
  const { t } = useTranslation()
  const { settings } = useStore()
  useEffect(() => {
    const handleKeyDown = (e) => {
      const startShortcut = settings?.shortcuts?.startPractice
      if (
        e.key === "Enter" ||
        (startShortcut && matchesShortcut(e, startShortcut))
      ) {
        onConfirm()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onConfirm, settings?.shortcuts?.startPractice])

  return (
    <Dialog open onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <HexBadge className="size-11 text-primary">
              <FileText className="h-5 w-5" />
            </HexBadge>
            <div className="flex flex-col gap-1.5 text-left">
              <div aria-hidden="true" className="hud-label !text-primary">
                READY // LAUNCH
              </div>
              <DialogTitle>{t("confirm")}</DialogTitle>
              <DialogDescription>{t("prepare")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="border-l-2 border-primary bg-primary/[0.06] px-4 py-3 text-sm text-muted-foreground">
          {t("prepare")}{" "}
          <span className="font-semibold text-foreground">&quot;{title}&quot;</span>{" "}
          {t("ready")}
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} className="gap-1.5">
            <Play className="size-4" />
            {t("start")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
