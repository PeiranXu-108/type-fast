import React from "react"

/**
 * Fixed decorative backdrop shared by every page:
 * accent glow, masked HUD grid, two drifting star layers, scanlines and a vignette.
 * Purely visual — pointer-events disabled and hidden from assistive tech.
 */
const SciFiBackdrop = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(70% 55% at 50% -12%, var(--backdrop-glow), transparent 70%), radial-gradient(45% 40% at 100% 100%, color-mix(in oklch, var(--neon-violet) 9%, transparent), transparent 70%), radial-gradient(40% 35% at 0% 85%, color-mix(in oklch, var(--primary) 7%, transparent), transparent 70%)",
      }}
    />
    <div className="hud-backdrop-grid absolute inset-0" />
    <div className="hud-stars-far animate-hud-stars-far absolute inset-x-0 top-0 h-[calc(100%+200px)]" />
    <div className="hud-stars animate-hud-stars absolute inset-x-0 top-0 h-[calc(100%+320px)]" />
    <div className="hud-scanlines absolute inset-0" />
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(130% 95% at 50% 35%, transparent 55%, var(--vignette) 100%)",
      }}
    />
  </div>
)

export default SciFiBackdrop
