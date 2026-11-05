import React, { useMemo, useRef, useEffect } from "react"
import { countWords, countCharacters, debounce } from "../utils.js"
import { useTranslation } from "react-i18next"
import { useStore } from "../store.js"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Terminal, Eraser, WrapText, Space, Play } from "lucide-react"

const TextInputCard = ({ value, onChange, onSubmit }) => {
  const { t } = useTranslation()
  const { settings, updateSettings } = useStore()
  const textareaRef = useRef(null)

  const wordCount = countWords(value)
  const charCount = countCharacters(value)

  const debouncedOnChange = useMemo(() => debounce(onChange, 150), [onChange])

  useEffect(() => {
    if (textareaRef.current && settings.ui?.customTextAreaHeight) {
      textareaRef.current.style.height = `${settings.ui.customTextAreaHeight}px`
    }
  }, [settings.ui?.customTextAreaHeight])

  const handleResize = useMemo(
    () =>
      debounce(() => {
        if (textareaRef.current) {
          const height = textareaRef.current.offsetHeight
          updateSettings({
            ui: {
              ...settings.ui,
              customTextAreaHeight: height,
            },
          })
        }
      }, 500),
    [settings.ui, updateSettings]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [handleResize])

  const handleClear = () => {
    onChange("")
  }

  const handleRemoveEmptyLines = () => {
    const cleaned = value
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join("\n")
    onChange(cleaned)
  }

  const handleRemoveExtraSpaces = () => {
    const cleaned = value
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter((line) => line.length > 0)
      .join("\n")
    onChange(cleaned)
  }

  return (
    <Card className="bg-background/40">
      <CardHeader className="space-y-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="size-4 text-primary" aria-hidden="true" />
            {t("practice.custom-text")}
          </CardTitle>
          <span aria-hidden="true" className="hud-label hidden sm:block">
            INPUT // BUFFER
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => debouncedOnChange(e.target.value)}
            placeholder={t("custom-text-placeholder")}
            className="min-h-32 max-h-[600px] resize-y font-mono text-sm leading-relaxed"
            disabled={false}
          />
          <p className="text-right font-mono text-xs text-muted-foreground">
            <span className="text-primary">{wordCount}</span> {t("word")} ·{" "}
            <span className="text-primary">{charCount}</span> {t("char")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <Eraser aria-hidden="true" />
              {t("practice.clear")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveEmptyLines}
            >
              <WrapText aria-hidden="true" />
              {t("practice.remove-empty-lines")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveExtraSpaces}
            >
              <Space aria-hidden="true" />
              {t("practice.remove-extra-spaces")}
            </Button>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={!value.trim()}
            onClick={onSubmit}
            className="shrink-0 px-6"
          >
            <Play aria-hidden="true" />
            {t("practice.start-practice")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TextInputCard
