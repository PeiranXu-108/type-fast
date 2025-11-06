import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Languages, Github } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useStore } from '../store.js'
import { useTranslation } from 'react-i18next'
const Navigation = () => {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { ui, setCurrentTab } = useStore()
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language || 'zh')
  
  useEffect(() => {
    setLanguage(i18n.language || 'zh')
  }, [i18n.language])
  const navItems = [
    { path: '/', label: t('navigation.practice'), tab: 'practice' },
    { path: '/history', label: t('navigation.history'), tab: 'history' },
    { path: '/settings', label: t('navigation.settings'), tab: 'settings' }
  ]
  
  const handleNavClick = (tab) => {
    setCurrentTab(tab)
  }
  
  const getThemeIcon = () => {
    switch (theme) {
      default:
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
    }
  }
  
  const cycleTheme = () => {
    const themes = ['dark', 'light']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Type Fast
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Right side - Theme toggle, language switch, and mobile menu */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={`当前主题: ${theme === 'system' ? '跟随系统' : theme === 'light' ? '浅色' : '深色'}`}
            >
              {getThemeIcon()}
            </button>
            {/* Language Switch */}
            <button
              onClick={() => {
                const newLanguage = language === 'zh' ? 'en' : 'zh'
                i18n.changeLanguage(newLanguage)
                setLanguage(newLanguage)
              }}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Languages className="w-5 h-5" />
            </button>
            
            {/* GitHub Link */}
            <a
              href="https://github.com/PeiranXu-108/type-fast"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>

            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
