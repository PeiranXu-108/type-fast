import React, { useMemo, useRef, useEffect } from "react"
import { countWords, countCharacters, debounce } from "../utils.js"
import { useTranslation } from "react-i18next"
import { useStore } from "../store.js"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

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
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-lg">{t("practice.custom-text")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => debouncedOnChange(e.target.value)}
            placeholder={t("custom-text-placeholder")}
            className="min-h-32 max-h-[600px] resize-y font-mono text-sm"
            disabled={false}
          />
          <p className="text-right text-xs text-muted-foreground">
            {wordCount} {t("word")} · {charCount} {t("char")}
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
              {t("practice.clear")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveEmptyLines}
            >
              {t("practice.remove-empty-lines")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveExtraSpaces}
            >
              {t("practice.remove-extra-spaces")}
            </Button>
          </div>
          <Button
            type="button"
            disabled={!value.trim()}
            onClick={onSubmit}
            className="shrink-0"
          >
            {t("practice.start-practice")}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start border-t pt-6">
        <p className="text-xs text-muted-foreground">{t("practice.tips")}</p>
        <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li>{t("practice.tips-multiline")}</li>
          <li>{t("practice.tips-punctuation")}</li>
          <li>{t("practice.tips-length")}</li>
        </ul>
      </CardFooter>
    </Card>
  )
}

export default TextInputCard
