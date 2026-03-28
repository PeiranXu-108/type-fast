import { useEffect } from 'react'
import { useStore } from '../store.js'

export const useTheme = () => {
  const { settings, updateSettings } = useStore()
  const theme = settings.theme
  const themeColor = settings.visual?.themeColor ?? 'blue'

  const setTheme = (next) => {
    updateSettings({ theme: next })
  }

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement

      root.classList.add('theme')

      // Remove existing theme classes
      root.classList.remove('light', 'dark', 'eye-care')

      if (theme === 'eye-care') {
        root.classList.add('light', 'eye-care')
      } else if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }

      if (themeColor === 'blue') {
        delete root.dataset.themeColor
      } else {
        root.dataset.themeColor = themeColor
      }
    }

    applyTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, themeColor])
  
  return {
    theme,
    setTheme
  }
}
