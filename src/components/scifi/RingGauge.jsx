import React from "react"
import { cn } from "@/lib/utils"
import { TONE_TEXT } from "./tones.js"

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SWEEP = 0.75 // 270° dial, gap at the bottom
const TICKS = 28

/**
 * 270° dial that visualises an existing value (no new metrics).
 * `display` is the formatted value shown in the centre.
 */
const RingGauge = ({ value, max, display, label, sub, tone = "primary", className }) => {
  const ratio = Math.max(0, Math.min(1, max > 0 ? Number(value || 0) / max : 0))
  const track = CIRCUMFERENCE * SWEEP

  return (
    <div className={cn("relative mx-auto aspect-square w-44", TONE_TEXT[tone], className)}>
      <svg viewBox="0 0 120 120" className="h-full w-full rotate-[135deg]" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--hud-line)"
          strokeWidth="5"
          strokeDasharray={`${track} ${CIRCUMFERENCE}`}
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray={`${track * ratio} ${CIRCUMFERENCE}`}
          style={{
            filter: "drop-shadow(0 0 4px currentColor)",
            transition: "stroke-dasharray 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
        {Array.from({ length: TICKS }).map((_, i) => {
          const angle = (i / (TICKS - 1)) * 270 * (Math.PI / 180)
          const inner = i % 3 === 0 ? 40 : 42.5
          const lit = i / (TICKS - 1) <= ratio
          return (
            <line
              key={i}
              x1={60 + Math.cos(angle) * inner}
              y1={60 + Math.sin(angle) * inner}
              x2={60 + Math.cos(angle) * 45}
              y2={60 + Math.sin(angle) * 45}
              stroke={lit ? "currentColor" : "var(--hud-line)"}
              strokeWidth="1"
              opacity={lit ? 0.9 : 0.7}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="neon-text font-display text-3xl font-bold tabular-nums leading-none">
          {display}
        </div>
        <div className="hud-label mt-2 !text-current opacity-90">{label}</div>
        {sub ? <div className="mt-1 max-w-[7.5rem] text-[11px] leading-tight text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  )
}

export default RingGauge
