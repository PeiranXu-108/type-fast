import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { useStore } from '../store.js'
import { formatDuration } from '../utils.js'

const PracticeControl = () => {
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
      }, 16) // ~60fps
      
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
              {currentArticle.wordCount} 词 • {practiceState.mode === 'lenient' ? '宽容模式' : '严格模式'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
              {formatDuration(elapsedTime)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              用时
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
            title={practiceState.mode === 'strict' ? '严格模式：错误需回退更正' : '宽容模式：错误可继续'}
          >
            {practiceState.mode === 'strict' ? '严格' : '宽容'}
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
                练习中
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始练习
              </>
            )}
          </button>
          
          {/* Restart button */}
          <button
            onClick={handleRestart}
            className="btn-secondary flex items-center justify-center"
            title="重新开始练习"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重新开始
          </button>
          
          {/* Stop button */}
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 h-10 flex items-center justify-center"
            title="停止练习"
          >
            停止
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>进度</span>
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
        <span>快捷键：</span>
        <span className="mx-2">Space 开始练习</span>
        <span className="mx-2">Esc 退出</span>
        <span className="mx-2">Ctrl+Enter 重开</span>
      </div>
    </div>
  )
}

export default PracticeControl
