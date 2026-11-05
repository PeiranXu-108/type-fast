import React from "react"
import { cn } from "@/lib/utils"

/**
 * Page header in HUD style: sector code, display title, subtitle and a ticked divider.
 * Decorative codes are aria-hidden; the title/subtitle text is passed in unchanged.
 */
const HudHeader = ({ code, title, subtitle, icon: Icon, className }) => (
  <header className={cn("relative animate-hud-rise", className)}>
    <div className="flex items-end justify-between gap-6">
      <div className="min-w-0">
        <div
          aria-hidden="true"
          className="hud-label mb-3 flex items-center gap-2 !text-primary"
        >
          <span className="hud-led animate-hud-pulse" />
          <span>{`// SECTOR ${code}`}</span>
          <span className="h-px w-12 bg-gradient-to-r from-primary/70 to-transparent" />
        </div>
        <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          {Icon ? (
            <Icon className="size-7 shrink-0 text-primary drop-shadow-[0_0_8px_var(--primary)]" />
          ) : null}
          <span className="min-w-0">{title}</span>
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div
        aria-hidden="true"
        className="hidden shrink-0 text-right font-mono text-[10px] leading-relaxed tracking-[0.2em] text-muted-foreground/70 md:block"
      >
        <div>
          SYS.STATUS <span className="text-neon-green">ONLINE</span>
        </div>
        <div>{`NODE // TF-${code}`}</div>
      </div>
    </div>

    <div aria-hidden="true" className="relative mt-5 h-px w-full bg-gradient-to-r from-primary/70 via-hud-line to-transparent">
      <span className="absolute -top-[3px] left-0 h-[7px] w-20 bg-primary shadow-[0_0_12px_var(--primary)] [clip-path:polygon(0_0,100%_0,calc(100%-7px)_100%,0_100%)]" />
      <span className="absolute -top-[5px] right-0 flex gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-px bg-hud-line",
              i % 3 === 0 ? "h-[11px]" : "h-[7px] translate-y-[2px]"
            )}
          />
        ))}
      </span>
    </div>
  </header>
)

export default HudHeader
