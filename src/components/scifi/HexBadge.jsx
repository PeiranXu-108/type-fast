import React from "react"
import { cn } from "@/lib/utils"

/**
 * Hexagon frame with centred content (icons, grade letters, logo glyph).
 * Colour follows `currentColor`, so tone it with a text-* class.
 */
const HexBadge = ({ children, className, glow = true, fillOpacity = 0.1 }) => (
  <span className={cn("relative inline-grid shrink-0 place-items-center", className)}>
    <svg
      viewBox="0 0 48 52"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden="true"
      style={glow ? { filter: "drop-shadow(0 0 6px color-mix(in oklch, currentColor 55%, transparent))" } : undefined}
    >
      <path
        d="M24 1.5 45.5 13.75v24.5L24 50.5 2.5 38.25v-24.5Z"
        fill="currentColor"
        fillOpacity={fillOpacity}
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 7.5 40.5 17v18L24 44.5 7.5 35V17Z"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="0.75"
        strokeDasharray="2 3"
      />
    </svg>
    <span className="relative">{children}</span>
  </span>
)

export default HexBadge
