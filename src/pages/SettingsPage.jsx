import React, { useEffect, useMemo, useState } from "react"
import { useStore } from "../store.js"
import { useTheme } from "../hooks/useTheme.js"
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

const SettingsPage = () => {
  const { settings, updateSettings, exportData, importData, clearAllData } =
    useStore()
  const { theme, setTheme } = useTheme()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importStatus, setImportStatus] = useState("")
  const { t } = useTranslation()
  const [editingShortcutKey, setEditingShortcutKey] = useState(null)
  const [shortcutError, setShortcutError] = useState("")

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
      case "system":
        return t("settings.follow-system")
      default:
        return t("settings.follow-system")
    }
  }

  const getModeLabel = (mode) => {
    return mode === "strict" ? t("settings.strict") : t("settings.lenient")
  }

  const getFontSizeLabel = (fontSize) => {
    switch (fontSize) {
      case "small":
        return t("settings.small")
      case "large":
        return t("settings.large")
      case "medium":
      default:
        return t("settings.medium")
    }
  }

  const getLineHeightLabel = (lineHeight) => {
    switch (lineHeight) {
      case "tight":
        return t("settings.tight")
      case "loose":
        return t("settings.loose")
      case "normal":
      default:
        return t("settings.normal")
    }
  }

  const getCursorStyleLabel = (cursorStyle) => {
    switch (cursorStyle) {
      case "block":
        return t("settings.block")
      case "line":
        return t("settings.line")
      case "underline":
      default:
        return t("settings.underline")
    }
  }

  const getWPMCalculationLabel = (method) => {
    return method === "word-based"
      ? t("settings.word-based")
      : t("settings.char-based")
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t("settings.appearance-settings")}
            </CardTitle>
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
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("settings.current")}: {getThemeLabel(theme)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.font-size")}</Label>
              <Select
                value={settings.visual.fontSize}
                onValueChange={(v) =>
                  handleNestedSettingChange("visual", "fontSize", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {getFontSizeLabel(settings.visual.fontSize)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t("settings.small")}</SelectItem>
                  <SelectItem value="medium">{t("settings.medium")}</SelectItem>
                  <SelectItem value="large">{t("settings.large")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.line-height")}</Label>
              <Select
                value={settings.visual.lineHeight}
                onValueChange={(v) =>
                  handleNestedSettingChange("visual", "lineHeight", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {getLineHeightLabel(settings.visual.lineHeight)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">{t("settings.tight")}</SelectItem>
                  <SelectItem value="normal">{t("settings.normal")}</SelectItem>
                  <SelectItem value="loose">{t("settings.loose")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.cursor-style")}</Label>
              <Select
                value={settings.visual.cursorStyle}
                onValueChange={(v) =>
                  handleNestedSettingChange("visual", "cursorStyle", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {getCursorStyleLabel(settings.visual.cursorStyle)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">{t("settings.block")}</SelectItem>
                  <SelectItem value="line">{t("settings.line")}</SelectItem>
                  <SelectItem value="underline">
                    {t("settings.underline")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="contrast">{t("settings.contrast-enhancement")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("settings.contrast-description")}
                </p>
              </div>
              <Switch
                id="contrast"
                checked={settings.visual.contrastEnhance}
                onCheckedChange={(checked) =>
                  handleNestedSettingChange(
                    "visual",
                    "contrastEnhance",
                    checked
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
              {t("settings.practice-settings")}
            </CardTitle>
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
                {t("settings.current")}: {getModeLabel(settings.defaultMode)}
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
              <p className="text-xs text-muted-foreground">
                {t("settings.current")}:{" "}
                {getWPMCalculationLabel(settings.wpmCalculation)}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-foreground">
                <Volume2 className="mr-2 h-4 w-4" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              {t("settings.data-management")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button
                type="button"
                variant="secondary"
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

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("settings.local-storage-usage")}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
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
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <Keyboard className="h-5 w-5 text-muted-foreground" />
              {t("settings.keyboard-shortcuts")}
            </CardTitle>
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
                          "rounded px-2 py-1 text-sm",
                          isEditing
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-foreground"
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
