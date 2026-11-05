import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Zap, Target, BarChart3, ArrowRight, Sparkles, Pencil, Eye } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import HexBadge from "@/components/scifi/HexBadge.jsx"

function useTypingEffect(phrases, { typeSpeed = 70, deleteSpeed = 40, pauseDuration = 2200 } = {}) {
  const [displayText, setDisplayText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex] || ""

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1))
        } else {
          setIsDeleting(false)
          setPhraseIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pauseDuration])

  return { displayText, isDeleting }
}

function useScrollReveal() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(node)
    return () => observer.unobserve(node)
  }, [])

  return [ref, isVisible]
}

/** Holographic key glyph: a framed key with corner brackets, drawn in the accent color. */
function HoloKeySVG({ letter, w = 56, h = 56, className, style }) {
  const r = Math.min(w, h)
  const arm = Math.max(5, r * 0.22)
  const corners = [
    `M1 ${1 + arm} V1 H${1 + arm}`,
    `M${w - 1 - arm} 1 H${w - 1} V${1 + arm}`,
    `M${w - 1} ${h - 1 - arm} V${h - 1} H${w - 1 - arm}`,
    `M${1 + arm} ${h - 1} H1 V${h - 1 - arm}`,
  ]

  return (
    <svg className={className} style={style} width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <rect
        x={3.5}
        y={3.5}
        width={w - 7}
        height={h - 7}
        fill="var(--primary)"
        fillOpacity="0.05"
        stroke="var(--primary)"
        strokeOpacity="0.28"
        strokeWidth="0.75"
      />
      {corners.map((d) => (
        <path key={d} d={d} stroke="var(--primary)" strokeOpacity="0.85" strokeWidth="1.25" />
      ))}
      <line x1={6} x2={w - 6} y1={h * 0.28} y2={h * 0.28} stroke="var(--primary)" strokeOpacity="0.12" strokeWidth="0.5" />
      {letter && (
        <text
          x={w / 2}
          y={h / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--primary)"
          fillOpacity="0.7"
          fontSize={r * 0.34}
          fontFamily="'Orbitron Variable', 'JetBrains Mono', monospace"
          fontWeight="600"
        >
          {letter}
        </text>
      )}
    </svg>
  )
}

const KEYCAP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")
const KEYCAP_SPECIALS = ["⇧", "↵", "⇥", "⌫"]
const KEYCAP_ANIMS = [
  "animate-landing-float",
  "animate-landing-float-delayed",
  "animate-landing-float-slow",
]

function generateKeycaps() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const rf = () => Math.random()
  const used = new Set()
  const caps = []
  const total = 18 + Math.floor(rf() * 7)

  for (let i = 0; i < total; i++) {
    const kind = rf()
    let letter, w, h

    if (kind < 0.05 && !caps.some((c) => !c.letter && c.w > 100)) {
      w = 120 + Math.floor(rf() * 40)
      h = 36 + Math.floor(rf() * 10)
      letter = null
    } else if (kind < 0.18) {
      letter = pick(KEYCAP_SPECIALS)
      w = 62 + Math.floor(rf() * 30)
      h = 42 + Math.floor(rf() * 12)
    } else {
      let l
      do {
        l = pick(KEYCAP_LETTERS)
      } while (used.has(l) && used.size < KEYCAP_LETTERS.length)
      used.add(l)
      letter = l
      const s = 36 + Math.floor(rf() * 30)
      w = s
      h = s
    }

    caps.push({
      key: i,
      letter,
      w,
      h,
      left: 1 + rf() * 93,
      top: 1 + rf() * 93,
      rotation: -16 + rf() * 32,
      opacity: 0.18 + rf() * 0.37,
      anim: pick(KEYCAP_ANIMS),
      delay: rf() * 6,
    })
  }

  return caps
}

/** Concentric HUD rings behind the hero title. */
function HoloRings() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[42%] aspect-square w-[min(118vw,880px)] -translate-x-1/2 -translate-y-1/2 opacity-70">
      <svg viewBox="0 0 400 400" className="animate-hud-spin absolute inset-0 h-full w-full" fill="none">
        <circle cx="200" cy="200" r="196" stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="0.6" strokeDasharray="1 6" />
        <path d="M200 4 A196 196 0 0 1 338.6 61.4" stroke="var(--primary)" strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M200 396 A196 196 0 0 1 61.4 338.6" stroke="var(--primary)" strokeOpacity="0.55" strokeWidth="1.2" />
      </svg>
      <svg viewBox="0 0 400 400" className="animate-hud-spin-rev absolute inset-[9%] h-[82%] w-[82%]" fill="none">
        <circle cx="200" cy="200" r="194" stroke="var(--primary)" strokeOpacity="0.14" strokeWidth="0.8" />
        <circle cx="200" cy="200" r="182" stroke="var(--primary)" strokeOpacity="0.28" strokeWidth="5" strokeDasharray="2 14" />
        <path d="M6 200 A194 194 0 0 1 63 63" stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="1" />
        <path d="M394 200 A194 194 0 0 1 337 337" stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="1" />
      </svg>
      <svg viewBox="0 0 400 400" className="animate-hud-spin-fast absolute inset-[22%] h-[56%] w-[56%]" fill="none">
        <circle cx="200" cy="200" r="190" stroke="var(--primary)" strokeOpacity="0.2" strokeWidth="0.8" strokeDasharray="40 12 4 12" />
      </svg>
    </div>
  )
}

function HoloField() {
  const [keycaps] = useState(generateKeycaps)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-[120px] animate-landing-drift dark:opacity-[0.22]"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="absolute -right-32 bottom-[10%] h-[380px] w-[380px] rounded-full opacity-[0.08] blur-[120px] animate-landing-drift-reverse dark:opacity-[0.16]"
        style={{ background: "var(--neon-violet)" }}
      />

      <HoloRings />

      {keycaps.map((cap) => (
        <div
          key={cap.key}
          className="absolute"
          style={{
            left: `${cap.left}%`,
            top: `${cap.top}%`,
            transform: `rotate(${cap.rotation}deg)`,
          }}
        >
          <HoloKeySVG
            letter={cap.letter}
            w={cap.w}
            h={cap.h}
            className={cap.anim}
            style={{
              opacity: cap.opacity,
              animationDelay: `${cap.delay.toFixed(1)}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, delay, isVisible, index }) {
  return (
    <div
      className={cn(
        "transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      )}
      style={{ transitionDelay: delay }}
    >
      <div className="hud-corners group relative h-full overflow-hidden rounded-[3px] border border-hud-line/70 bg-panel p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_0_36px_-12px_var(--hud-glow)]">
        <div className="mb-6 flex items-start justify-between">
          <HexBadge className="size-12 text-primary transition-transform duration-500 group-hover:rotate-[30deg]">
            <Icon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-[30deg]" />
          </HexBadge>
          <span aria-hidden="true" className="font-mono text-xs tracking-[0.2em] text-muted-foreground/60">
            {`M-${String(index).padStart(2, "0")}`}
          </span>
        </div>
        <h3 className="mb-2 font-display text-base font-semibold tracking-wide text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-primary/0 shadow-[0_0_12px_var(--primary)] transition-all duration-500 group-hover:w-full" />
      </div>
    </div>
  )
}

function LiveTypingDemo() {
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Small steps. Big speed. Keep typing.",
    "Accuracy first—speed will follow.",
    "Train daily. Type confidently.",
    "Less backspace. More flow.",
    "Eyes up. Hands steady. Rhythm on.",
    "Warm up, then push your pace.",
    "Build muscle memory, one line at a time.",
    "Clean keystrokes beat rushed mistakes.",
    "Find your cadence and stay in it.",
    "Slow is smooth; smooth is fast.",
    "Track progress—celebrate tiny wins.",
    "Focus on form, then turn up the tempo.",
    "Precision today, personal best tomorrow.",
    "Breathe. Relax. Let the keys click.",
  ]

  const [sampleTextIndex, setSampleTextIndex] = useState(() =>
    Math.floor(Math.random() * sampleTexts.length)
  )
  const [charIndex, setCharIndex] = useState(0)
  const sampleText = sampleTexts[sampleTextIndex]

  useEffect(() => {
    if (charIndex >= sampleText.length) {
      const resetTimeout = setTimeout(() => {
        setCharIndex(0)
        setSampleTextIndex((prev) => {
          if (sampleTexts.length <= 1) return prev
          let next = prev
          while (next === prev) {
            next = Math.floor(Math.random() * sampleTexts.length)
          }
          return next
        })
      }, 1500)
      return () => clearTimeout(resetTimeout)
    }

    const speed = 60 + Math.random() * 80
    const timeout = setTimeout(() => setCharIndex((i) => i + 1), speed)
    return () => clearTimeout(timeout)
  }, [charIndex, sampleText.length, sampleTexts.length])

  const progress = Math.round((Math.min(charIndex, sampleText.length) / sampleText.length) * 100)

  return (
    <div className="hud-corners hud-glow relative mx-auto mt-12 max-w-xl overflow-hidden rounded-[3px] bg-panel p-5 text-left font-mono text-sm backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2 border-b border-hud-line/60 pb-3">
        <div className="h-2 w-2 bg-neon-red shadow-[0_0_6px_var(--neon-red)]" />
        <div className="h-2 w-2 bg-neon-amber shadow-[0_0_6px_var(--neon-amber)]" />
        <div className="h-2 w-2 bg-neon-green shadow-[0_0_6px_var(--neon-green)]" />
        <span className="ml-2 text-xs tracking-wider text-muted-foreground">type-fast</span>
        <span aria-hidden="true" className="ml-auto flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-primary/80">
          <span className="hud-led animate-hud-pulse" />
          {`LIVE ${String(progress).padStart(3, "0")}%`}
        </span>
      </div>
      <div className="min-h-[1.75rem] leading-relaxed tracking-wide">
        {sampleText.split("").map((char, i) => (
          <span
            key={i}
            className={cn(
              "transition-colors duration-100",
              i < charIndex
                ? "neon-text text-primary"
                : i === charIndex
                  ? "relative text-foreground"
                  : "text-muted-foreground/40"
            )}
          >
            {i === charIndex && (
              <span className="absolute -left-[1px] top-0 h-full w-[2px] animate-landing-cursor bg-primary shadow-[0_0_8px_var(--primary)]" />
            )}
            {char}
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="mt-4 h-[3px] w-full bg-hud-line/40">
        <div
          className="h-full bg-primary shadow-[0_0_10px_var(--primary)] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-primary/10 to-transparent animate-hud-scan-y"
      />
    </div>
  )
}

const LandingPage = () => {
  const { t } = useTranslation()
  const [featuresRef, featuresVisible] = useScrollReveal()
  const [heroLoaded, setHeroLoaded] = useState(false)

  const phrases = [
    t("landing.subtitle_1"),
    t("landing.subtitle_2"),
    t("landing.subtitle_3"),
  ]

  const { displayText } = useTypingEffect(phrases)

  useEffect(() => {
    requestAnimationFrame(() => setHeroLoaded(true))
  }, [])

  return (
    <div className="relative z-10 min-h-screen overflow-hidden">
      <HoloField />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pb-24 pt-28">
        <div aria-hidden="true" className="hud-floor">
          <div className="hud-floor-plane" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[36%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />

        <div
          className={cn(
            "relative z-10 text-center transition-all duration-1000",
            heroLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="mb-7 inline-flex items-center gap-2.5 border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-xs tracking-[0.16em] text-primary backdrop-blur-sm">
            <span className="hud-led animate-hud-pulse" aria-hidden="true" />
            <Zap className="h-3.5 w-3.5" />
            {t("landing.badge")}
          </div>

          <h1 className="holo-title mb-6 font-display text-[clamp(2.4rem,10.5vw,8.25rem)] font-black uppercase leading-[0.95] tracking-[0.06em]">
            Type Fast
          </h1>

          <div aria-hidden="true" className="mx-auto mb-5 flex w-72 items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/70" />
            <span className="size-1.5 rotate-45 border border-primary bg-primary/40 shadow-[0_0_8px_var(--primary)]" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/70" />
          </div>

          <p className="mx-auto mb-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("landing.description")}
          </p>

          <div className="mb-10 h-8 font-mono text-lg font-medium text-foreground/90 sm:text-xl">
            <span aria-hidden="true" className="mr-2 text-primary">&gt;</span>
            <span>{displayText}</span>
            <span className="ml-1 inline-block h-5 w-[10px] translate-y-0.5 animate-landing-cursor bg-primary/80 shadow-[0_0_10px_var(--primary)] sm:h-6" />
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/practice"
              state={{ autoStartRandomSample: true }}
              className="hud-btn-solid group inline-flex h-12 items-center gap-3 px-10 text-base font-bold uppercase tracking-[0.16em] transition-transform duration-300 [--cut:12px] hover:scale-[1.04]"
            >
              {t("landing.get_started")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <LiveTypingDemo />
        </div>

        {/* Scroll hint */}
        <div aria-hidden="true" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground/70">SCROLL</span>
          <div className="relative h-10 w-px overflow-hidden bg-hud-line">
            <span className="absolute inset-x-0 top-0 h-3 bg-primary shadow-[0_0_8px_var(--primary)] animate-hud-scan-y" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-16">
        <div
          className={cn(
            "mb-14 text-center transition-all duration-700",
            featuresVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div aria-hidden="true" className="hud-label mb-3 flex items-center justify-center gap-3 !text-primary">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/70" />
            {"// SYSTEM MODULES"}
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/70" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            {t("landing.features_title")}
          </h2>
          <p className="text-muted-foreground">{t("landing.features_subtitle")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title={t("landing.feature_speed")}
            description={t("landing.feature_speed_desc")}
            delay="100ms"
            isVisible={featuresVisible}
            index={1}
          />
          <FeatureCard
            icon={Target}
            title={t("landing.feature_accuracy")}
            description={t("landing.feature_accuracy_desc")}
            delay="250ms"
            isVisible={featuresVisible}
            index={2}
          />
          <FeatureCard
            icon={BarChart3}
            title={t("landing.feature_modes")}
            description={t("landing.feature_modes_desc")}
            delay="400ms"
            isVisible={featuresVisible}
            index={3}
          />
          <FeatureCard
            icon={Sparkles}
            title={t("landing.feature_ai")}
            description={t("landing.feature_ai_desc")}
            delay="550ms"
            isVisible={featuresVisible}
            index={4}
          />
          <FeatureCard
            icon={Pencil}
            title={t("landing.feature_custom")}
            description={t("landing.feature_custom_desc")}
            delay="700ms"
            isVisible={featuresVisible}
            index={5}
          />
          <FeatureCard
            icon={Eye}
            title={t("landing.feature_headpose")}
            description={t("landing.feature_headpose_desc")}
            delay="850ms"
            isVisible={featuresVisible}
            index={6}
          />
        </div>
      </section>

      <footer className="relative z-10 border-t border-hud-line/50 px-6 py-8 text-center font-mono text-xs tracking-wider text-muted-foreground/80">
        Copyright © 2026 Ryan Xu. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
