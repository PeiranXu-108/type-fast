import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useStore } from "../store.js"
import { useTheme } from "../hooks/useTheme.js"
import { HeadPoseDetector } from "../lib/headPoseDetector.js"
import {
  Settings,
  Palette,
  Volume2,
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  Keyboard,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  DEFAULT_SHORTCUTS,
  eventToShortcut,
  formatShortcut,
  isModifierOnlyShortcut,
  shortcutsEqual,
} from "../utils/shortcuts.js"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import HudHeader from "../components/scifi/HudHeader.jsx"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const THEME_COLOR_VALUES = [
  "blue",
  "green",
  "orange",
  "rose",
  "violet",
  "amber",
  "teal",
  "slate",
]

const FONT_SIZE_VALUES = ["xs", "small", "medium", "large", "xl"]
const FONT_FAMILY_VALUES = [
  "jetbrains-mono",
  "fira-code",
  "source-code-pro",
  "ibm-plex-mono",
  "pacifico",
  "caveat",
]

const FONT_FAMILY_STYLE = {
  "jetbrains-mono": "'JetBrains Mono', monospace",
  "fira-code": "'Fira Code', monospace",
  "source-code-pro": "'Source Code Pro', monospace",
  "ibm-plex-mono": "'IBM Plex Mono', monospace",
  pacifico: "'Pacifico', cursive",
  caveat: "'Caveat', cursive",
}

const CURSOR_STYLES = [
  "block",
  "line",
  "underline",
  "glow-block",
  "glow-line",
  "pulse-block",
]

function CursorPreview({ styleId }) {
  return (
    <span className="flex items-center justify-center w-6 h-6 mr-2 border border-hud-line/60 bg-background/40 rounded-[2px] shrink-0 overflow-hidden">
      <span className={`inline-block leading-none cursor-style-${styleId}`}>
        &nbsp;
      </span>
    </span>
  )
}

/** Each swatch reads the same --tone-* variable that drives --primary, so it matches the active mode */
const THEME_COLOR_SWATCH = {
  blue: "var(--tone-blue)",
  green: "var(--tone-green)",
  orange: "var(--tone-orange)",
  rose: "var(--tone-rose)",
  violet: "var(--tone-violet)",
  amber: "var(--tone-amber)",
  teal: "var(--tone-teal)",
  slate: "var(--tone-slate)",
}

function ThemeColorSwatch({ colorId }) {
  const fill = THEME_COLOR_SWATCH[colorId] ?? THEME_COLOR_SWATCH.blue
  return (
    <span
      className="size-4 shrink-0 rounded-[2px] border border-hud-line"
      style={{
        backgroundColor: fill,
        boxShadow: `0 0 8px -1px ${fill}`,
      }}
      aria-hidden
    />
  )
}

const EMPTY_HEADPOSE_DEBUG_STATE = {
  status: "unknown",
  scores: {
    down: 0,
    forward: 0,
    up: 0,
  },
  predictions: [],
  isCameraReady: false,
  isModelReady: false,
  lastUpdatedAt: null,
  error: "",
}

function HeadPoseScoreRow({ label, score, toneClass }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">
          {(score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden border border-hud-line/60 bg-background/50">
        <div
          className={cn("h-full transition-all duration-200", toneClass)}
          style={{ width: `${Math.max(0, Math.min(score * 100, 100))}%` }}
        />
      </div>
    </div>
  )
}

function HeadPoseDebugDialog({
  open,
  onOpenChange,
  samplingMs,
  onDetectorUnavailable,
  t,
}) {
  const detectorRef = useRef(null)
  const previewRef = useRef(null)
  const attachedPreviewRef = useRef(null)
  const [debugState, setDebugState] = useState(EMPTY_HEADPOSE_DEBUG_STATE)
  const [isStarting, setIsStarting] = useState(false)

  const attachPreviewStream = useCallback(async () => {
    const previewEl = previewRef.current
    const stream = detectorRef.current?.getStream()

    if (!previewEl || !stream) return

    attachedPreviewRef.current = previewEl

    if (previewEl.srcObject !== stream) {
      previewEl.srcObject = stream
    }

    try {
      await previewEl.play()
    } catch {
      // Some browsers require a user gesture before play() resolves.
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setIsStarting(false)
      setDebugState(EMPTY_HEADPOSE_DEBUG_STATE)
      return
    }

    let isDisposed = false
    const detector = new HeadPoseDetector({ samplingMs })
    detectorRef.current = detector
    setIsStarting(true)
    setDebugState(EMPTY_HEADPOSE_DEBUG_STATE)

    const unsubscribeStatus = detector.subscribe((status) => {
      if (!isDisposed) {
        setDebugState((previous) => ({ ...previous, status }))
      }
    })

    const unsubscribeDebug = detector.subscribeDebug((nextState) => {
      if (!isDisposed) {
        setDebugState(nextState)
      }
    })

    detector
      .start()
      .then(async () => {
        if (isDisposed) return
        await attachPreviewStream()
      })
      .catch((error) => {
        if (isDisposed) return
        console.warn("Head pose debug preview failed:", error)
        setDebugState((previous) => ({
          ...previous,
          error: t("settings.headpose-debug-error"),
          status: "unknown",
        }))
        onDetectorUnavailable()
      })
      .finally(() => {
        if (!isDisposed) {
          setIsStarting(false)
        }
      })

    return () => {
      isDisposed = true
      unsubscribeStatus()
      unsubscribeDebug()

      const previewEl = attachedPreviewRef.current
      if (previewEl) {
        previewEl.pause?.()
        previewEl.srcObject = null
      }

      detector.stop()
      detectorRef.current = null
      attachedPreviewRef.current = null
    }
  }, [attachPreviewStream, open, onDetectorUnavailable, samplingMs, t])

  useEffect(() => {
    if (!open || !debugState.isCameraReady) return
    attachPreviewStream()
  }, [attachPreviewStream, debugState.isCameraReady, open])

  const statusLabel =
    debugState.status === "down"
      ? t("practice-control.headpose-status-down")
      : debugState.status === "no-face"
        ? t("practice-control.headpose-status-no-face")
      : debugState.status === "up"
        ? t("practice-control.headpose-status-up")
        : t("practice-control.headpose-status-checking")

  const statusTextClass =
    debugState.status === "down"
      ? "text-neon-red"
      : debugState.status === "up"
        ? "text-neon-green"
        : debugState.status === "no-face"
          ? "text-neon-amber"
          : "text-muted-foreground"

  const cameraStatusLoading = !debugState.isCameraReady && isStarting
  const modelStatusLoading = !debugState.isModelReady && isStarting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("settings.headpose-debug-title")}</DialogTitle>
          <DialogDescription>
            {t("settings.headpose-debug-description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid items-stretch gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex h-full">
            <div className="hud-corners relative min-h-[320px] w-full overflow-hidden border border-hud-line bg-black">
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover [transform:scaleX(-1)]"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-full w-px bg-primary/15" />
                <div className="absolute left-0 top-1/2 h-px w-full bg-primary/15" />
                <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40" />
                <div className="hud-label absolute left-3 top-3 flex items-center gap-1.5 !text-neon-red">
                  <span className="hud-led animate-hud-pulse" />
                  REC // CAM-01
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-hud-line/60 bg-background/40 p-3">
                <div className="hud-label">
                  {t("settings.headpose-debug-current-status")}
                </div>
                <div className={cn("mt-1 text-sm font-semibold", statusTextClass)}>
                  {statusLabel}
                </div>
              </div>
              <div className="border border-hud-line/60 bg-background/40 p-3">
                <div className="hud-label">
                  {t("settings.headpose-debug-camera")}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  {cameraStatusLoading ? <Spinner className="size-3.5" /> : null}
                  <span>
                    {debugState.isCameraReady
                      ? t("settings.headpose-debug-ready")
                      : isStarting
                        ? t("settings.headpose-debug-loading")
                        : t("settings.headpose-debug-waiting")}
                  </span>
                </div>
              </div>
              <div className="border border-hud-line/60 bg-background/40 p-3">
                <div className="hud-label">
                  {t("settings.headpose-debug-model")}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  {modelStatusLoading ? <Spinner className="size-3.5" /> : null}
                  <span>
                    {debugState.isModelReady
                      ? t("settings.headpose-debug-ready")
                      : isStarting
                        ? t("settings.headpose-debug-loading")
                        : t("settings.headpose-debug-waiting")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 border border-hud-line/60 bg-background/30 p-4">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {t("settings.headpose-debug-scores")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("settings.headpose-debug-score-description")}
                </div>
              </div>

              <HeadPoseScoreRow
                label={t("settings.headpose-debug-score-down")}
                score={debugState.scores.down}
                toneClass="bg-neon-red shadow-[0_0_10px_var(--neon-red)]"
              />
              <HeadPoseScoreRow
                label={t("settings.headpose-debug-score-forward")}
                score={debugState.scores.forward}
                toneClass="bg-neon-amber shadow-[0_0_10px_var(--neon-amber)]"
              />
              <HeadPoseScoreRow
                label={t("settings.headpose-debug-score-up")}
                score={debugState.scores.up}
                toneClass="bg-neon-green shadow-[0_0_10px_var(--neon-green)]"
              />
            </div>

            {debugState.error ? (
              <div className="border-l-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {debugState.error}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("settings.headpose-debug-close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SettingsPage = () => {
  const { settings, updateSettings, exportData, importData, clearAllData } =
    useStore()
  const { theme, setTheme } = useTheme()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importStatus, setImportStatus] = useState("")
  const { t } = useTranslation()
  const [editingShortcutKey, setEditingShortcutKey] = useState(null)
  const [shortcutError, setShortcutError] = useState("")
  const [isHeadPoseDialogOpen, setIsHeadPoseDialogOpen] = useState(false)

  const shortcuts = settings?.shortcuts || DEFAULT_SHORTCUTS

  const shortcutItems = useMemo(
    () => [
      { key: "startPractice", label: t("settings.start-practice") },
      { key: "exitPractice", label: t("settings.exit-practice") },
      { key: "restartPractice", label: t("settings.restart") },
      { key: "toggleMode", label: t("settings.toggle-mode") },
    ],
    [t]
  )

  useEffect(() => {
    if (!editingShortcutKey) return

    const onKeyDown = (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (isModifierOnlyShortcut(e.code)) {
        setShortcutError(t("settings.shortcut-modifier-only"))
        return
      }

      const next = eventToShortcut(e)
      const conflict = Object.entries(shortcuts).find(([k, v]) => {
        if (k === editingShortcutKey) return false
        return shortcutsEqual(v, next)
      })
      if (conflict) {
        setShortcutError(t("settings.shortcut-conflict"))
        return
      }

      updateSettings({
        shortcuts: {
          ...shortcuts,
          [editingShortcutKey]: next,
        },
      })
      setEditingShortcutKey(null)
      setShortcutError("")
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [editingShortcutKey, shortcuts, t, updateSettings])

  const resetShortcuts = () => {
    updateSettings({ shortcuts: DEFAULT_SHORTCUTS })
    setEditingShortcutKey(null)
    setShortcutError("")
  }

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value })
  }

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    updateSettings({
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value,
      },
    })
  }

  const handleHeadPoseEnabledChange = useCallback(
    (checked) => {
      updateSettings({
        headPoseTraining: {
          ...(settings.headPoseTraining || {}),
          enabled: checked,
        },
      })
      setIsHeadPoseDialogOpen(checked)
    },
    [settings.headPoseTraining, updateSettings]
  )

  const handleHeadPoseDetectorUnavailable = useCallback(() => {
    updateSettings({
      headPoseTraining: {
        ...(settings.headPoseTraining || {}),
        enabled: false,
      },
    })
  }, [settings.headPoseTraining, updateSettings])

  const handleExport = () => {
    exportData()
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const success = importData(text)

      if (success) {
        setImportStatus("success")
        setTimeout(() => setImportStatus(""), 3000)
      } else {
        setImportStatus("error")
        setTimeout(() => setImportStatus(""), 3000)
      }
    } catch {
      setImportStatus("error")
      setTimeout(() => setImportStatus(""), 3000)
    }

    event.target.value = ""
  }

  const handleClearData = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  const getStorageSize = () => {
    try {
      let totalSize = 0
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          const item = localStorage.getItem(key)
          if (item) {
            totalSize += key.length + item.length
          }
        }
      }
      return (totalSize / 1024).toFixed(2)
    } catch (error) {
      console.error("Error calculating storage size:", error)
      return "0.00"
    }
  }

  const getThemeLabel = (themeValue) => {
    switch (themeValue) {
      case "light":
        return t("settings.light")
      case "dark":
        return t("settings.dark")
      case "eye-care":
        return t("settings.eye-care")
      case "system":
        return t("settings.follow-system")
      default:
        return t("settings.follow-system")
    }
  }

  const getModeLabel = (mode) => {
    return mode === "strict" ? t("settings.strict") : t("settings.lenient")
  }

  const getModeDescription = (mode) => {
    return mode === "strict"
      ? t("practice-control.strict-mode-desc")
      : t("practice-control.lenient-mode-desc")
  }

  const getFontSizeLabel = (fontSize) => {
    switch (fontSize) {
      case "xs":
        return t("settings.extra-small")
      case "small":
        return t("settings.small")
      case "large":
        return t("settings.large")
      case "xl":
        return t("settings.extra-large")
      case "medium":
      default:
        return t("settings.medium")
    }
  }

  const getCursorStyleLabel = (cursorStyle) => {
    switch (cursorStyle) {
      case "block":
        return t("settings.block")
      case "line":
        return t("settings.line")
      case "glow-block":
        return t("settings.glow-block")
      case "glow-line":
        return t("settings.glow-line")
      case "pulse-block":
        return t("settings.pulse-block")
      case "underline":
      default:
        return t("settings.underline")
    }
  }

  const getThemeColorLabel = (colorId) =>
    t(`settings.theme-color-${colorId}`)
  const getFontFamilyLabel = (fontFamilyId) =>
    t(`settings.font-family-${fontFamilyId}`)

  const getWPMCalculationLabel = (method) => {
    return method === "word-based"
      ? t("settings.word-based")
      : t("settings.char-based")
  }

  const getHeadPoseGraceLabel = (gracePeriodMs) => {
    if (gracePeriodMs === 500) return t("settings.headpose-grace-500")
    if (gracePeriodMs === 1500) return t("settings.headpose-grace-1500")
    return t("settings.headpose-grace-1000")
  }

  return (
    <div className="space-y-8">
      <HudHeader
        code="03"
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                {t("settings.appearance-settings")}
              </CardTitle>
              <span aria-hidden="true" className="hud-label">CFG.01</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.theme")}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue>{getThemeLabel(theme)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    {t("settings.follow-system")}
                  </SelectItem>
                  <SelectItem value="light">{t("settings.light")}</SelectItem>
                  <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                  <SelectItem value="eye-care">{t("settings.eye-care")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("settings.current")}: {getThemeLabel(theme)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.theme-color")}</Label>
              <Select
                value={settings.visual.themeColor ?? "blue"}
                onValueChange={(v) =>
                  handleNestedSettingChange("visual", "themeColor", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-left">
                        {getThemeColorLabel(
                          settings.visual.themeColor ?? "blue"
                        )}
                      </span>
                      <ThemeColorSwatch
                        colorId={settings.visual.themeColor ?? "blue"}
                      />
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {THEME_COLOR_VALUES.map((id) => (
                    <SelectItem key={id} value={id}>
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-0 flex-1 truncate">
                          {getThemeColorLabel(id)}
                        </span>
                        <ThemeColorSwatch colorId={id} />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.font-family")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.font-style-description")}
              </p>
              <Select
                value={settings.visual.fontFamily ?? "jetbrains-mono"}
                onValueChange={(v) =>
                  handleNestedSettingChange("visual", "fontFamily", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span
                      className="truncate text-left"
                      style={{
                        fontFamily:
                          FONT_FAMILY_STYLE[
                            settings.visual.fontFamily ?? "jetbrains-mono"
                          ],
                      }}
                    >
                      {getFontFamilyLabel(
                        settings.visual.fontFamily ?? "jetbrains-mono"
                      )}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILY_VALUES.map((id) => (
                    <SelectItem key={id} value={id}>
                      <span
                        className="truncate"
                        style={{ fontFamily: FONT_FAMILY_STYLE[id] }}
                      >
                        {getFontFamilyLabel(id)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.font-size")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.font-size-description")}
              </p>
              <div
                data-slot="button-group"
                className="flex w-full gap-1 border border-hud-line/60 bg-background/40 p-1"
              >
                {FONT_SIZE_VALUES.map((size) => {
                  const active = (settings.visual.fontSize ?? "medium") === size
                  return (
                    <Button
                      key={size}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "ghost"}
                      aria-pressed={active}
                      className={cn(
                        "flex-1",
                        active && "relative z-10"
                      )}
                      onClick={() =>
                        handleNestedSettingChange("visual", "fontSize", size)
                      }
                    >
                      {getFontSizeLabel(size)}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.cursor-style")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.cursor-style-description")}
              </p>
              <Select
                value={settings.visual.cursorStyle}
                onValueChange={(v) =>
                  handleNestedSettingChange("visual", "cursorStyle", v)
                }
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <CursorPreview styleId={settings.visual.cursorStyle ?? "block"} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {CURSOR_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      <span className="flex items-center gap-2">
                        <CursorPreview styleId={style} />
                        <span>{getCursorStyleLabel(style)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-neon-green" />
                {t("settings.practice-settings")}
              </CardTitle>
              <span aria-hidden="true" className="hud-label">CFG.02</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.default-practice-mode")}</Label>
              <Select
                value={settings.defaultMode}
                onValueChange={(v) => handleSettingChange("defaultMode", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{getModeLabel(settings.defaultMode)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lenient">
                    {t("settings.lenient")}
                  </SelectItem>
                  <SelectItem value="strict">{t("settings.strict")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
              {getModeLabel(settings.defaultMode)}:{" "}
                {getModeDescription(settings.defaultMode)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.wpm-calculation")}</Label>
              <Select
                value={settings.wpmCalculation}
                onValueChange={(v) =>
                  handleSettingChange("wpmCalculation", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {getWPMCalculationLabel(settings.wpmCalculation)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="word-based">
                    {t("settings.word-based")}
                  </SelectItem>
                  <SelectItem value="char-based">
                    {t("settings.char-based")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 border-t border-hud-line/40 pt-4">
              <h3 className="flex items-center text-sm font-medium text-foreground">
                <Volume2 className="mr-2 h-4 w-4 text-primary" />
                {t("settings.sound-settings")}
              </h3>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="sound-key" className="font-normal">
                  {t("settings.key-press-sound")}
                </Label>
                <Switch
                  id="sound-key"
                  checked={settings.sounds.keyPress}
                  onCheckedChange={(checked) =>
                    handleNestedSettingChange("sounds", "keyPress", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="sound-done" className="font-normal">
                  {t("settings.completion-sound")}
                </Label>
                <Switch
                  id="sound-done"
                  checked={settings.sounds.completion}
                  onCheckedChange={(checked) =>
                    handleNestedSettingChange("sounds", "completion", checked)
                  }
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-hud-line/40 pt-4">
              <h3 className="flex items-center text-sm font-medium text-foreground">
                <Monitor className="mr-2 h-4 w-4 text-primary" />
                {t("settings.headpose-settings")}
              </h3>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="headpose-enabled" className="font-normal">
                    {t("settings.headpose-enable")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.headpose-description")}
                  </p>
                </div>
                <Switch
                  id="headpose-enabled"
                  checked={Boolean(settings.headPoseTraining?.enabled)}
                  onCheckedChange={handleHeadPoseEnabledChange}
                />
              </div>

              {settings.headPoseTraining?.enabled ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHeadPoseDialogOpen(true)}
                  >
                    {t("settings.headpose-debug-open")}
                  </Button>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>{t("settings.headpose-grace-period")}</Label>
                <Select
                  value={String(settings.headPoseTraining?.gracePeriodMs || 1000)}
                  onValueChange={(v) =>
                    handleSettingChange("headPoseTraining", {
                      ...(settings.headPoseTraining || {}),
                      gracePeriodMs: Number(v),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getHeadPoseGraceLabel(
                        settings.headPoseTraining?.gracePeriodMs || 1000
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">
                      {t("settings.headpose-grace-500")}
                    </SelectItem>
                    <SelectItem value="1000">
                      {t("settings.headpose-grace-1000")}
                    </SelectItem>
                    <SelectItem value="1500">
                      {t("settings.headpose-grace-1500")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5 text-neon-violet" />
                {t("settings.data-management")}
              </CardTitle>
              <span aria-hidden="true" className="hud-label">CFG.03</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                {t("settings.export-data")}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("settings.export-description")}
              </p>
            </div>

            <div className="flex items-center justify-between border border-hud-line/50 border-l-2 border-l-primary/70 bg-background/40 p-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t("settings.local-storage-usage")}
                </span>
              </div>
              <span className="neon-text font-mono text-sm font-semibold text-primary">
                {getStorageSize()} KB
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("settings.storage-description")}
            </p>

            <div className="space-y-2">
              <Label htmlFor="import-json">{t("settings.import-data")}</Label>
              <Input
                id="import-json"
                type="file"
                accept=".json"
                onChange={handleImport}
              />
              {importStatus && (
                <p
                  className={cn(
                    "text-xs",
                    importStatus === "success"
                      ? "text-neon-green"
                      : "text-neon-red"
                  )}
                >
                  {importStatus === "success"
                    ? t("settings.import-success")
                    : t("settings.import-failed")}
                </p>
              )}
            </div>

            <div>
              <Button
                type="button"
                variant="destructive"
                className="w-full gap-2"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                {t("settings.clear-all-data")}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("settings.clear-description")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5 text-neon-info" />
                {t("settings.keyboard-shortcuts")}
              </CardTitle>
              <span aria-hidden="true" className="hud-label">CFG.04</span>
            </div>
            <CardDescription>
              {editingShortcutKey
                ? t("settings.press-shortcut")
                : t("settings.shortcut-tip")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetShortcuts}
              >
                {t("settings.reset-shortcuts")}
              </Button>
            </div>

            {shortcutError && (
              <p className="text-xs text-destructive">{shortcutError}</p>
            )}

            {shortcutItems.map((item, index) => {
              const value = shortcuts?.[item.key]
              const isEditing = editingShortcutKey === item.key
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between gap-2 py-2">
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <kbd
                        className={cn(
                          "hud-kbd px-2 py-1 text-sm",
                          isEditing
                            ? "animate-hud-glow border-primary text-primary"
                            : "text-foreground"
                        )}
                      >
                        {isEditing
                          ? t("settings.listening")
                          : formatShortcut(value)}
                      </kbd>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShortcutError("")
                          setEditingShortcutKey(item.key)
                        }}
                      >
                        {t("settings.edit-shortcut")}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingShortcutKey(null)
                            setShortcutError("")
                          }}
                        >
                          {t("cancel")}
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < shortcutItems.length - 1 ? <Separator /> : null}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <HeadPoseDebugDialog
        open={isHeadPoseDialogOpen}
        onOpenChange={setIsHeadPoseDialogOpen}
        samplingMs={settings.headPoseTraining?.samplingMs || 300}
        onDetectorUnavailable={handleHeadPoseDetectorUnavailable}
        t={t}
      />

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              {t("settings.confirm-clear-data")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.clear-data-warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={handleClearData}
            >
              {t("settings.confirm-clear")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SettingsPage
