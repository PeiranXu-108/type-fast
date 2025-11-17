import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useBattleStore } from '../store/battleStore.js'
import { useStore } from '../store.js'
import { calculateWPMFromText, calculateCPM, calculateAccuracy } from '../utils.js'
import OpponentProgress from './OpponentProgress.jsx'
import { useTranslation } from 'react-i18next'

const BattleTypingArea = ({ socket, emit, on, off }) => {
  const { t } = useTranslation()
  const { room, gameState, updateMyProgress, setGameResult, ui } = useBattleStore()
  const { settings } = useStore()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState([])
  const [keystrokes, setKeystrokes] = useState(0)
  const [backspaces, setBackspaces] = useState(0)
  const [realTimeStats, setRealTimeStats] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100
  })
  const [isCompleted, setIsCompleted] = useState(false)
  
  const containerRef = useRef(null)
  const statsIntervalRef = useRef(null)
  const progressThrottleRef = useRef(null)

  const { article, startTime, myProgress, opponentProgress } = gameState

  // 聚焦输入区域
  useEffect(() => {
    if (gameState.status === 'playing' && ui.countdown === 0) {
      containerRef.current?.focus()
    }
  }, [gameState.status, ui.countdown])

  // 发送进度更新（节流）
  const sendProgress = (progress) => {
    if (progressThrottleRef.current) {
      clearTimeout(progressThrottleRef.current)
    }
    
    progressThrottleRef.current = setTimeout(() => {
      if (room?.id && socket && !isCompleted) {
        emit('typing-progress', {
          roomId: room.id,
          progress: {
            currentIndex: progress.currentIndex,
            wpm: progress.wpm,
            cpm: progress.cpm,
            accuracy: progress.accuracy,
            errors: progress.errors,
            totalKeystrokes: progress.keystrokes,
            backspaces: progress.backspaces
          }
        })
        
        updateMyProgress(progress)
      }
    }, 100) // 每100ms发送一次
  }

  // 实时统计计算
  useEffect(() => {
    if (gameState.status === 'playing' && startTime && article && !isCompleted) {
      statsIntervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - startTime
        
        if (elapsed > 0) {
          const wpm = calculateWPMFromText(article.content, currentIndex, elapsed)
          const cpm = calculateCPM(currentIndex, elapsed)
          const correctChars = currentIndex - errors.length
          const accuracy = calculateAccuracy(correctChars, keystrokes)
          
          setRealTimeStats({ wpm, cpm, accuracy })
          
          // 发送进度
          sendProgress({
            currentIndex,
            wpm,
            cpm,
            accuracy,
            errors,
            keystrokes,
            backspaces
          })
        }
      }, 100)
      
      return () => {
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current)
        }
      }
    }
  }, [gameState.status, startTime, currentIndex, errors, keystrokes, backspaces, article, isCompleted])

  // 处理按键
  const handleKeyDown = (e) => {
    if (gameState.status !== 'playing' || !article || isCompleted || ui.countdown > 0) return
    
    e.preventDefault()
    
    const expectedChar = article.content[currentIndex]
    const pressedChar = e.key
    
    // 处理特殊按键
    if (pressedChar === 'Escape') {
      return
    }
    
    // 处理退格
    if (pressedChar === 'Backspace') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
        setBackspaces(prev => prev + 1)
        setKeystrokes(prev => prev + 1)
        
        // 移除最后一个错误（如果存在）
        if (errors.length > 0 && errors[errors.length - 1].index === currentIndex - 1) {
          setErrors(prev => prev.slice(0, -1))
        }
      }
      return
    }
    
    // 处理普通字符
    if (pressedChar.length === 1) {
      setKeystrokes(prev => prev + 1)
      
      if (pressedChar === expectedChar) {
        // 正确
        const newIndex = currentIndex + 1
        setCurrentIndex(newIndex)
        
        // 检查是否完成
        if (newIndex >= article.content.length) {
          handleComplete()
        }
      } else {
        // 错误
        setErrors(prev => [...prev, {
          index: currentIndex,
          expected: expectedChar,
          actual: pressedChar
        }])
        const newIndex = currentIndex + 1
        setCurrentIndex(newIndex)
        
        // 检查是否完成（即使有错误）
        if (newIndex >= article.content.length) {
          handleComplete()
        }
      }
    }
  }

  // 完成游戏
  const handleComplete = () => {
    if (isCompleted) return
    
    setIsCompleted(true)
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    const finalWpm = calculateWPMFromText(article.content, currentIndex, durationMs)
    const finalCpm = calculateCPM(currentIndex, durationMs)
    const correctChars = currentIndex - errors.length
    const finalAccuracy = calculateAccuracy(correctChars, keystrokes)
    
    const result = {
      wpm: finalWpm,
      cpm: finalCpm,
      accuracy: finalAccuracy / 100,
      durationMs,
      totalChars: article.content.length,
      completedChars: currentIndex,
      errors,
      totalKeystrokes: keystrokes,
      backspaces
    }
    
    // 发送完成事件
    if (room?.id && socket) {
      emit('game-complete', {
        roomId: room.id,
        result
      })
    }
    
    // 更新本地状态
    updateMyProgress({
      ...result,
      completed: true
    })
  }

  // 渲染文本
  const renderText = () => {
    if (!article) return null
    
    const chars = article.content.split('')
    const errorIndexSet = new Set(errors.map(e => e.index))
    
    return chars.map((char, index) => {
      let className = 'font-mono inline-block'
      
      if (index < currentIndex) {
        const isError = errorIndexSet.has(index)
        className += isError ? ' typing-error' : ' typing-correct'
      } else if (index === currentIndex) {
        className += ' typing-current'
      }
      
      if (char === '\n') {
        return <br key={index} />
      } else if (char === ' ') {
        return (
          <span key={index} className={className}>
            &nbsp;
          </span>
        )
      } else {
        return (
          <span key={index} className={className}>
            {char}
          </span>
        )
      }
    })
  }

  // 倒计时显示
  if (ui.countdown > 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4 animate-pulse">
          {ui.countdown}
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('battle.get-ready')}
        </p>
      </div>
    )
  }

  if (!article) return null

  return (
    <div className="space-y-6">
      {/* 对手进度 */}
      {opponentProgress && (
        <OpponentProgress progress={opponentProgress} />
      )}
      
      {/* 实时统计对比 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 我的数据 */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
            {t('battle.your-stats')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {realTimeStats.wpm}
              </div>
              <div className="text-xs text-gray-500">WPM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {realTimeStats.cpm}
              </div>
              <div className="text-xs text-gray-500">CPM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {realTimeStats.accuracy}%
              </div>
              <div className="text-xs text-gray-500">{t('results.accuracy')}</div>
            </div>
          </div>
        </div>
        
        {/* 对手数据 */}
        {opponentProgress && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              {t('battle.opponent-stats')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {opponentProgress.wpm || 0}
                </div>
                <div className="text-xs text-gray-500">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {opponentProgress.cpm || 0}
                </div>
                <div className="text-xs text-gray-500">CPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {opponentProgress.accuracy || 0}%
                </div>
                <div className="text-xs text-gray-500">{t('results.accuracy')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 打字区域 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {article.title}
        </h3>
        
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="w-full p-6 border-2 border-primary-300 dark:border-primary-600 rounded-lg font-mono text-lg leading-relaxed whitespace-pre-wrap overflow-auto focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 cursor-text"
          style={{ minHeight: '300px', maxHeight: '600px' }}
        >
          <div className="select-none leading-7">
            {renderText()}
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>{t('practice-control.progress')}</span>
            <span>{Math.round((currentIndex / article.content.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / article.content.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BattleTypingArea

