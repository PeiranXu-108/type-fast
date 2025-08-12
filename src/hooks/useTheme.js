import { useEffect } from 'react'
import { useStore } from '../store.js'

export const useTheme = () => {
  const { settings, updateSettings } = useStore()
  
  const setTheme = (theme) => {
    updateSettings({ theme })
  }
  
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      const { theme } = settings
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      
      if (theme === 'system') {
        // Check system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
    
    applyTheme()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])
  
  return {
    theme: settings.theme,
    setTheme
  }
}
