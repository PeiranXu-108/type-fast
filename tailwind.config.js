import tailwindcssAnimate from "tailwindcss-animate"

/**
 * Colors are backed by CSS variables (see src/index.css). Tailwind 3 cannot apply
 * `/opacity` modifiers to a bare `var(--x)` color (the utility is silently dropped),
 * so mix the variable with transparent instead. This keeps `bg-primary/10`,
 * `border-hud-line/60` etc. working and following the active theme + accent color.
 */
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined ||
  opacityValue === "1" ||
  String(opacityValue).startsWith("var(--tw-")
    ? `var(--${name})`
    : `color-mix(in oklch, var(--${name}) calc(${opacityValue} * 100%), transparent)`

const CJK_SANS = [
  "PingFang SC",
  "Hiragino Sans GB",
  "Microsoft YaHei",
  "Noto Sans SC",
  "Source Han Sans SC",
  "system-ui",
  "sans-serif",
]

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        sans: ["Oxanium Variable", "Geist Variable", ...CJK_SANS],
        display: ["Orbitron Variable", "Oxanium Variable", ...CJK_SANS],
        heading: ["var(--font-heading)", "Orbitron Variable", ...CJK_SANS],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      ringWidth: {
        3: "3px",
      },
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        chart: {
          1: token("chart-1"),
          2: token("chart-2"),
          3: token("chart-3"),
          4: token("chart-4"),
          5: token("chart-5"),
        },
        sidebar: {
          DEFAULT: token("sidebar"),
          foreground: token("sidebar-foreground"),
          primary: token("sidebar-primary"),
          "primary-foreground": token("sidebar-primary-foreground"),
          accent: token("sidebar-accent"),
          "accent-foreground": token("sidebar-accent-foreground"),
          border: token("sidebar-border"),
          ring: token("sidebar-ring"),
        },
        // HUD surfaces
        panel: token("panel"),
        hud: {
          line: token("hud-line"),
          glow: token("hud-glow"),
        },
        // Semantic neon signals (bright in dark mode, deeper in light modes)
        neon: {
          info: token("neon-info"),
          green: token("neon-green"),
          amber: token("neon-amber"),
          red: token("neon-red"),
          violet: token("neon-violet"),
          orange: token("neon-orange"),
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      keyframes: {
        "landing-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(3deg)" },
        },
        "landing-float-delayed": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(-2.5deg)" },
        },
        "landing-float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(1.5deg)" },
        },
        "landing-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
        "landing-drift-reverse": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-25px, 20px) scale(0.95)" },
          "66%": { transform: "translate(15px, -25px) scale(1.08)" },
        },
        "landing-drift-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -10px) scale(1.03)" },
        },
        "landing-cursor": {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "landing-scroll-dot": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(6px)" },
        },
        // Sci-fi HUD motion
        "hud-scan": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        "hud-scan-y": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(900%)" },
        },
        "hud-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "hud-spin-rev": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "hud-flicker": {
          "0%, 100%": { opacity: "1" },
          "8%": { opacity: "0.35" },
          "10%": { opacity: "1" },
          "12%": { opacity: "0.6" },
          "14%": { opacity: "1" },
          "60%": { opacity: "1" },
          "61%": { opacity: "0.75" },
          "62%": { opacity: "1" },
        },
        "hud-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.85)" },
        },
        "hud-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "hud-grid-flow": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "0 48px" },
        },
        "hud-stars": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-320px)" },
        },
        "hud-stars-far": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-200px)" },
        },
        "hud-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "landing-float": "landing-float 6s ease-in-out infinite",
        "landing-float-delayed": "landing-float-delayed 7s ease-in-out infinite",
        "landing-float-slow": "landing-float-slow 9s ease-in-out infinite",
        "landing-drift": "landing-drift 12s ease-in-out infinite",
        "landing-drift-reverse": "landing-drift-reverse 14s ease-in-out infinite",
        "landing-drift-slow": "landing-drift-slow 18s ease-in-out infinite",
        "landing-cursor": "landing-cursor 1s step-end infinite",
        "landing-scroll-dot": "landing-scroll-dot 1.5s ease-in-out infinite",
        "hud-scan": "hud-scan 5s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "hud-scan-slow": "hud-scan 9s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "hud-scan-y": "hud-scan-y 7s linear infinite",
        "hud-spin": "hud-spin 40s linear infinite",
        "hud-spin-fast": "hud-spin 12s linear infinite",
        "hud-spin-rev": "hud-spin-rev 60s linear infinite",
        "hud-flicker": "hud-flicker 6s linear infinite",
        "hud-pulse": "hud-pulse 1.8s ease-in-out infinite",
        "hud-glow": "hud-glow 3s ease-in-out infinite",
        "hud-grid-flow": "hud-grid-flow 2.4s linear infinite",
        "hud-stars": "hud-stars 90s linear infinite",
        "hud-stars-far": "hud-stars-far 140s linear infinite",
        "hud-rise": "hud-rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
