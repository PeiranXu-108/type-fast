import React, { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Sun, Moon, Eye, Languages, Github, Menu } from "lucide-react"
import { useTheme } from "../hooks/useTheme.js"
import { useStore } from "../store.js"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
        return <Moon className="size-5" />
      case "eye-care":
        return <Eye className="size-5" />
      default:
        return <Sun className="size-5" />
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
      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )

  return (
    <nav
      className={cn(
        "top-0 z-50 transition-all duration-300",
        isLanding
          ? "absolute left-0 right-0 bg-transparent"
          : "sticky border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">Type Fast</span>
          </Link>

          {!isLanding && (
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.tab)}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
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
              onClick={() => {
                const newLanguage = language === "zh" ? "en" : "zh"
                i18n.changeLanguage(newLanguage)
                setLanguage(newLanguage)
              }}
              title={language === "zh" ? "Switch to English" : "切换到中文"}
            >
              <Languages className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="GitHub Repository"
              render={
                <a
                  href="https://github.com/PeiranXu-108/type-fast"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Github className="size-5" />
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
                      aria-label="Open menu"
                    />
                  }
                >
                  <Menu className="size-6" />
                </SheetTrigger>
                <SheetContent side="right" className="w-[min(100%,20rem)]">
                  <nav className="mt-2 flex flex-col gap-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => handleNavClick(item.tab)}
                        className={({ isActive }) =>
                          cn(
                            "rounded-lg px-4 py-3 text-sm font-medium",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
