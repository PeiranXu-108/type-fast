import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { useStore } from '../store.js'
import { formatDuration } from '../utils.js'
import { useTranslation } from 'react-i18next'
const PracticeControl = () => {
  const { t } = useTranslation()
  const { currentArticle, practiceState, settings, updatePracticeState, stopPractice } = useStore()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timer, setTimer] = useState(null)
  
  // Timer effect
  useEffect(() => {
    if (practiceState.isActive) {
      const interval = setInterval(() => {
        const now = Date.now()
        const actualElapsed = now - practiceState.startTime
        setElapsedTime(actualElapsed)
      }, 100) // reduce update frequency to ease re-renders
      
      setTimer(interval)
      
      return () => clearInterval(interval)
    } else {
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }
    }
  }, [practiceState.isActive, practiceState.startTime])
  
  // Stop timer when practice is completed
  useEffect(() => {
    if (practiceState.currentIndex >= currentArticle?.content.length && practiceState.isActive) {
      // Practice is completed, stop the timer
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }
    }
  }, [practiceState.currentIndex, currentArticle, practiceState.isActive, timer])
  
  const handleStart = () => {
    if (currentArticle) {
      setElapsedTime(0)
      useStore.getState().startPractice(currentArticle, practiceState.mode)
    }
  }
  
  const handleRestart = () => {
    if (currentArticle) {
      setElapsedTime(0)
      useStore.getState().startPractice(currentArticle, practiceState.mode)
    }
  }
  
  const handleModeToggle = () => {
    const newMode = practiceState.mode === 'lenient' ? 'strict' : 'lenient'
    updatePracticeState({ mode: newMode })
  }
  
  const handleStop = () => {
    stopPractice()
    setElapsedTime(0)
  }
  
  if (!currentArticle) return null
  
  return (
    <div className="card p-4 sticky top-20 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Article info and timer */}
        <div className="flex items-center space-x-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {currentArticle.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentArticle.wordCount} {t('word')} • {practiceState.mode === 'lenient' ? t('practice-control.lenient-mode') : t('practice-control.strict-mode')}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
              {formatDuration(elapsedTime)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('results.elapsed-time')}
            </div>
          </div>
        </div>
        
        {/* Right side - Control buttons */}
        <div className="flex items-center space-x-3 h-10">
          {/* Mode toggle */}
          <button
            onClick={handleModeToggle}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 h-10 flex items-center justify-center ${
              practiceState.mode === 'strict'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            }`}
            title={practiceState.mode === 'strict' ? t('practice-control.strict-mode-description') : t('practice-control.lenient-mode-description')}
          >
            {practiceState.mode === 'strict' ? t('practice-control.strict') : t('practice-control.lenient')}
          </button>
          
          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={practiceState.isActive}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {practiceState.isActive ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                {t('practice-control.practicing')}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {t('practice-control.restart')}
              </>
            )}
          </button>
          
          {/* Restart button */}
          <button
            onClick={handleRestart}
            className="btn-secondary flex items-center justify-center"
            title={t('restart-practice')}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('practice-control.restart')}
          </button>
          
          {/* Stop button */}
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-200 dark:bg-red-500 hover:bg-red-300 dark:hover:bg-red-400 text-red-600 dark:text-red-300 font-medium rounded-lg transition-colors duration-200 h-10 flex items-center justify-center"
            title={t('practice-control.stop-practice')}
          >
            {t('practice-control.exit')}
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>{t('practice-control.progress')}</span>
          <span>{Math.round((practiceState.currentIndex / currentArticle.content.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(practiceState.currentIndex / currentArticle.content.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Keyboard shortcuts info */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{t('practice-control.keyboard-shortcuts')}</span>
        <span className="mx-2">{t('practice-control.space-start')}</span>
        <span className="mx-2">{t('practice-control.esc-exit')}</span>
        <span className="mx-2">{t('practice-control.ctrl-enter-restart')}</span>
      </div>
    </div>
  )
}

export default PracticeControl
