import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Zap, Target, BarChart3, ArrowRight, Sparkles, Pencil, Eye } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

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

function KeycapSVG({ letter, w = 56, h = 56, className, style }) {
  const r = Math.min(w, h)
  const rx = r * 0.14
  const irx = r * 0.09
  const pad = r * 0.09
  const depth = r * 0.06

  return (
    <svg className={className} style={style} width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <rect x={2} y={depth + 1} width={w - 4} height={h - depth} rx={rx + 1} fill="var(--primary)" opacity="0.1" />
      <rect x={0.75} y={0.75} width={w - 1.5} height={h - depth} rx={rx} fill="var(--primary)" fillOpacity="0.04" stroke="var(--primary)" strokeWidth="0.75" opacity="0.2" />
      <rect x={pad + 3} y={pad + 1} width={w - (pad + 3) * 2} height={h - depth - (pad + 1) * 2} rx={irx} fill="var(--primary)" fillOpacity="0.02" stroke="var(--primary)" strokeWidth="0.5" opacity="0.14" />
      <path
        d={`M${pad + 6} ${pad + 2.5} Q${w / 2} ${pad} ${w - pad - 6} ${pad + 2.5}`}
        stroke="var(--primary)" strokeWidth="0.5" opacity="0.12" fill="none" strokeLinecap="round"
      />
      {letter && (
        <text
          x={w / 2}
          y={(h - depth) / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--primary)"
          opacity="0.25"
          fontSize={r * 0.32}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
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

function AnimatedBackground() {
  const [keycaps] = useState(generateKeycaps)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full opacity-[0.04] blur-[120px] animate-landing-drift dark:opacity-[0.07]"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="absolute -right-32 bottom-[10%] h-[350px] w-[350px] rounded-full opacity-[0.03] blur-[120px] animate-landing-drift-reverse dark:opacity-[0.05]"
        style={{ background: "var(--primary)" }}
      />

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
          <KeycapSVG
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

function FeatureCard({ icon: Icon, title, description, delay, isVisible }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      )}
      style={{ transitionDelay: delay }}
    >
      <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="absolute -bottom-1 left-0 h-1 w-0 bg-gradient-to-r from-primary/60 to-primary/0 transition-all duration-500 group-hover:w-full" />
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

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-xl border border-border/50 bg-card/40 p-5 font-mono text-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-error-400/60" />
        <div className="h-3 w-3 rounded-full bg-amber-400/60" />
        <div className="h-3 w-3 rounded-full bg-success-400/60" />
        <span className="ml-2 text-xs text-muted-foreground/60">type-fast</span>
      </div>
      <div className="leading-relaxed tracking-wide">
        {sampleText.split("").map((char, i) => (
          <span
            key={i}
            className={cn(
              "transition-colors duration-100",
              i < charIndex
                ? "text-primary"
                : i === charIndex
                  ? "relative text-foreground"
                  : "text-muted-foreground/30"
            )}
          >
            {i === charIndex && (
              <span className="absolute -left-[1px] top-0 h-full w-[2px] animate-landing-cursor bg-primary" />
            )}
            {char}
          </span>
        ))}
      </div>
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
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20">
        <div
          className={cn(
            "relative z-10 text-center transition-all duration-1000",
            heroLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            {t("landing.badge")}
          </div>

          <h1 className="mb-6 text-6xl font-bold tracking-tight text-primary sm:text-7xl md:text-8xl lg:text-9xl">
            Type Fast
          </h1>

          <div className="mx-auto mb-4 h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />

          <p className="mx-auto mb-2 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("landing.description")}
          </p>

          <div className="mb-10 h-8 text-lg font-medium text-foreground/80 sm:text-xl">
            <span>{displayText}</span>
            <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 animate-landing-cursor bg-primary sm:h-6" />
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/practice"
              state={{ autoStartRandomSample: true }}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
            >
              {t("landing.get_started")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <LiveTypingDemo />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-8 w-5 rounded-full border-2 border-muted-foreground/20">
            <div className="mx-auto mt-1 h-2 w-1 animate-landing-scroll-dot rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 mx-auto max-w-5xl px-6 pb-32 pt-8">
        <div
          className={cn(
            "mb-14 text-center transition-all duration-700",
            featuresVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            {t("landing.features_title")}
          </h2>
          <p className="text-muted-foreground">{t("landing.features_subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title={t("landing.feature_speed")}
            description={t("landing.feature_speed_desc")}
            delay="100ms"
            isVisible={featuresVisible}
          />
          <FeatureCard
            icon={Target}
            title={t("landing.feature_accuracy")}
            description={t("landing.feature_accuracy_desc")}
            delay="250ms"
            isVisible={featuresVisible}
          />
          <FeatureCard
            icon={BarChart3}
            title={t("landing.feature_modes")}
            description={t("landing.feature_modes_desc")}
            delay="400ms"
            isVisible={featuresVisible}
          />
          <FeatureCard
            icon={Sparkles}
            title={t("landing.feature_ai")}
            description={t("landing.feature_ai_desc")}
            delay="550ms"
            isVisible={featuresVisible}
          />
          <FeatureCard
            icon={Pencil}
            title={t("landing.feature_custom")}
            description={t("landing.feature_custom_desc")}
            delay="700ms"
            isVisible={featuresVisible}
          />
          <FeatureCard
            icon={Eye}
            title={t("landing.feature_headpose")}
            description={t("landing.feature_headpose_desc")}
            delay="850ms"
            isVisible={featuresVisible}
          />
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-muted-foreground/80">
        Copyright © 2026 Ryan Xu. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
