import React, { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Sun, Moon, Eye, Languages, Github, Menu } from "lucide-react"
import { useTheme } from "../hooks/useTheme.js"
import { useStore } from "../store.js"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import HexBadge from "./scifi/HexBadge.jsx"

const hudIconButton =
  "size-8 border border-hud-line/70 bg-panel/40 text-muted-foreground hover:border-primary/70 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_-4px_var(--hud-glow)] sm:size-9"

const Navigation = () => {
  const { theme, setTheme } = useTheme()
  const { setCurrentTab } = useStore()
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language || "zh")
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === "/"

  useEffect(() => {
    setLanguage(i18n.language || "zh")
  }, [i18n.language])

  const navItems = [
    { path: "/practice", label: t("navigation.practice"), tab: "practice" },
    { path: "/history", label: t("navigation.history"), tab: "history" },
    { path: "/settings", label: t("navigation.settings"), tab: "settings" },
  ]

  const handleNavClick = (tab) => {
    setCurrentTab(tab)
    setMobileOpen(false)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="size-[18px]" />
      case "eye-care":
        return <Eye className="size-[18px]" />
      default:
        return <Sun className="size-[18px]" />
    }
  }

  const cycleTheme = () => {
    const themes = ["light", "eye-care", "dark", "system"]
    const currentIndex = themes.indexOf(theme)
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const navLinkClass = ({ isActive }) =>
    cn(
      "relative flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide transition-colors [--cut:7px]",
      isActive
        ? "hud-chamfer-outline text-primary"
        : "border border-transparent text-muted-foreground hover:text-foreground"
    )

  const renderNavContent = (item, index) => ({ isActive }) => (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "font-mono text-[10px] tracking-wider",
          isActive ? "text-primary" : "text-muted-foreground/60"
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className={cn(isActive && "neon-text")}>{item.label}</span>
    </>
  )

  return (
    <nav
      className={cn(
        "top-0 z-50 transition-all duration-300",
        isLanding
          ? "absolute left-0 right-0 bg-transparent"
          : "sticky bg-background/70 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
            <HexBadge className="size-8 text-primary transition-transform duration-300 group-hover:rotate-[30deg] sm:size-9">
              <span className="font-display text-sm font-black leading-none">T</span>
            </HexBadge>
            <span className="flex flex-col">
              <span className="whitespace-nowrap font-display text-sm font-bold uppercase leading-none tracking-[0.12em] text-foreground sm:text-lg sm:tracking-[0.16em]">
                Type
                <span aria-hidden="true" className="px-0.5 text-primary">
                  //
                </span>
                <span className="sr-only"> </span>
                Fast
              </span>
              <span
                aria-hidden="true"
                className="mt-1 hidden font-mono text-[9px] uppercase leading-none tracking-[0.3em] text-muted-foreground/70 sm:block"
              >
                Typing Console · HUD
              </span>
            </span>
          </Link>

          {!isLanding && (
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.tab)}
                  className={navLinkClass}
                >
                  {renderNavContent(item, index)}
                </NavLink>
              ))}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={hudIconButton}
              onClick={cycleTheme}
              title={
                theme === "system"
                  ? t("settings.follow-system")
                  : theme === "light"
                    ? t("settings.light")
                    : theme === "eye-care"
                      ? t("settings.eye-care")
                      : theme === "dark"
                        ? t("settings.dark")
                        : t("settings.follow-system")
              }
            >
              {getThemeIcon()}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={hudIconButton}
              onClick={() => {
                const newLanguage = language === "zh" ? "en" : "zh"
                i18n.changeLanguage(newLanguage)
                setLanguage(newLanguage)
              }}
              title={language === "zh" ? "Switch to English" : "切换到中文"}
            >
              <Languages className="size-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={hudIconButton}
              title="GitHub Repository"
              render={
                <a
                  href="https://github.com/PeiranXu-108/type-fast"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Github className="size-[18px]" />
            </Button>

            {!isLanding && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  className="md:hidden"
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={hudIconButton}
                      aria-label="Open menu"
                    />
                  }
                >
                  <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent side="right" className="w-[min(100%,20rem)] pt-14">
                  <div
                    aria-hidden="true"
                    className="hud-label flex items-center gap-2 px-1 !text-primary"
                  >
                    <span className="hud-led animate-hud-pulse" />
                    NAV // MODULES
                  </div>
                  <nav className="mt-1 flex flex-col gap-1.5">
                    {navItems.map((item, index) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => handleNavClick(item.tab)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide [--cut:8px]",
                            isActive
                              ? "hud-chamfer-outline text-primary"
                              : "border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                          )
                        }
                      >
                        {renderNavContent(item, index)}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {!isLanding && (
        <div
          aria-hidden="true"
          className="relative h-px w-full overflow-hidden bg-gradient-to-r from-transparent via-hud-line to-transparent"
        >
          <span className="animate-hud-scan-slow absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}
    </nav>
  )
}

export default Navigation
