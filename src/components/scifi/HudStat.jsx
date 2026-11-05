import React from "react"
import { cn } from "@/lib/utils"
import { TONE_TEXT } from "./tones.js"

const SIZE_TEXT = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl sm:text-5xl",
}

/** Instrument readout: mono label above a glowing display-font value. */
const HudStat = ({
  label,
  value,
  tone = "primary",
  size = "md",
  icon: Icon,
  sub,
  align = "left",
  className,
  valueClassName,
}) => (
  <div className={cn("min-w-0", align === "center" && "text-center", className)}>
    <div
      className={cn(
        "hud-label flex items-center gap-1.5",
        align === "center" && "justify-center"
      )}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </div>
    <div
      className={cn(
        "neon-text mt-1.5 font-display font-bold leading-none tabular-nums",
        TONE_TEXT[tone] || TONE_TEXT.primary,
        SIZE_TEXT[size] || SIZE_TEXT.md,
        valueClassName
      )}
    >
      {value}
    </div>
    {sub ? <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div> : null}
  </div>
)

export default HudStat
