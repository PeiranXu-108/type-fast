import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store.js'
import { calculateWPM, calculateCPM, calculateAccuracy, calculateWPMFromText } from '../utils.js'

const UnifiedTypingArea = () => {
  const { currentArticle, practiceState, updatePracticeState, saveRecord, showResults } = useStore()
  const [startTime, setStartTime] = useState(null)
  const [realTimeStats, setRealTimeStats] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100
  })
  
  const containerRef = useRef(null)
  const statsIntervalRef = useRef(null)
  
  // Focus container when practice starts
  useEffect(() => {
    if (practiceState.isActive) {
      containerRef.current?.focus()
    }
  }, [practiceState.isActive])
  
  // Handle practice completion
  useEffect(() => {
    if (practiceState.currentIndex >= currentArticle?.content.length) {
      handlePracticeComplete()
    }
  }, [practiceState.currentIndex, currentArticle])
  
  // Real-time stats calculation
  useEffect(() => {
    if (practiceState.isActive && startTime) {
      statsIntervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - startTime
        
        if (elapsed > 0) {
          // Use the new WPM calculation function that properly counts words
          const wpm = calculateWPMFromText(currentArticle.content, practiceState.currentIndex, elapsed)
          const cpm = calculateCPM(practiceState.currentIndex, elapsed)
          const accuracy = calculateAccuracy(practiceState.currentIndex, practiceState.keystrokes)
          
          setRealTimeStats({ wpm, cpm, accuracy })
        }
      }, 100)
      
      return () => {
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current)
        }
      }
    }
  }, [practiceState.isActive, startTime, practiceState.currentIndex, practiceState.keystrokes, currentArticle])
  
  const handleKeyDown = (e) => {
    if (!practiceState.isActive) return
    
    e.preventDefault()
    
    const expectedChar = currentArticle.content[practiceState.currentIndex]
    const pressedChar = e.key
    
    // Handle special keys
    if (pressedChar === 'Escape') {
      useStore.getState().stopPractice()
      return
    }
    
    if (e.ctrlKey && pressedChar === 'Enter') {
      if (currentArticle) {
        useStore.getState().startPractice(currentArticle, practiceState.mode)
      }
      return
    }
    
    // Handle backspace
    if (pressedChar === 'Backspace') {
      if (practiceState.mode === 'strict' && practiceState.currentIndex > 0) {
        updatePracticeState({
          currentIndex: practiceState.currentIndex - 1,
          backspaces: practiceState.backspaces + 1,
          keystrokes: practiceState.keystrokes + 1
        })
      }
      return
    }
    
    // Handle regular character input (including space and other characters)
    if (pressedChar.length === 1) {
      // Handle space characters specially - normalize both current and expected chars
      const normalizedPressedChar = pressedChar === ' ' ? ' ' : pressedChar
      const normalizedExpectedChar = expectedChar === ' ' ? ' ' : expectedChar
      
      if (normalizedPressedChar === normalizedExpectedChar) {
        // Correct character
        updatePracticeState({
          currentIndex: practiceState.currentIndex + 1,
          keystrokes: practiceState.keystrokes + 1
        })
        
        // Start timer on first correct input
        if (!startTime) {
          setStartTime(Date.now())
        }
      } else if (practiceState.mode === 'lenient') {
        // Lenient mode - allow errors but track them
        const error = {
          index: practiceState.currentIndex,
          expected: expectedChar,
          actual: pressedChar
        }
        
        updatePracticeState({
          currentIndex: practiceState.currentIndex + 1,
          errors: [...practiceState.errors, error],
          keystrokes: practiceState.keystrokes + 1
        })
        
        if (!startTime) {
          setStartTime(Date.now())
        }
      }
      // In strict mode, wrong characters are ignored
    }
  }
  
  const handlePracticeComplete = () => {
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Calculate final WPM using the same function for consistency
    const finalWpm = calculateWPMFromText(currentArticle.content, practiceState.currentIndex, totalTime)
    
    const record = {
      durationMs: totalTime,
      startedAt: startTime,
      endedAt: endTime,
      wpm: finalWpm,
      cpm: realTimeStats.cpm,
      accuracy: realTimeStats.accuracy / 100,
      totalKeystrokes: practiceState.keystrokes,
      backspaces: practiceState.backspaces,
      errors: practiceState.errors,
      meta: {}
    }
    
    saveRecord(record)
    showResults()
    
    // Reset practice state
    updatePracticeState({
      isActive: false,
      currentIndex: 0,
      startTime: 0,
      errors: [],
      backspaces: 0,
      keystrokes: 0
    })
    
    setStartTime(null)
    setRealTimeStats({ wpm: 0, cpm: 0, accuracy: 100 })
  }
  
  const renderText = () => {
    if (!currentArticle) return null
    
    const content = currentArticle.content
    const chars = content.split('')
    
    return chars.map((char, index) => {
      let className = 'font-mono inline-block'
      
      if (index < practiceState.currentIndex) {
        // Already typed
        const isError = practiceState.errors.some(error => error.index === index)
        className += isError ? ' typing-error' : ' typing-correct'
      } else if (index === practiceState.currentIndex) {
        // Current character
        className += ' typing-current'
      }
      
      // Handle line breaks and spaces
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
  
  // Calculate text dimensions for proper height adjustment
  const getTextDimensions = () => {
    if (!currentArticle) return { lines: 0, height: 400 }
    
    const content = currentArticle.content
    const lines = content.split('\n').length
    const maxLineLength = Math.max(...content.split('\n').map(line => line.length))
    
    // Calculate height based on lines and content length
    // Each line approximately 24px height, plus padding and margins
    const baseHeight = 100 // padding and margins
    const lineHeight = 24 // estimated line height
    const estimatedHeight = Math.max(400, Math.min(800, lines * lineHeight + baseHeight))
    
    return {
      lines,
      maxLineLength,
      height: estimatedHeight
    }
  }
  
  if (!currentArticle) return null
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        练习区域
      </h3>
      
      {/* Real-time Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {realTimeStats.wpm}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">WPM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {realTimeStats.cpm}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">CPM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {realTimeStats.accuracy}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">准确率</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {practiceState.backspaces}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">退格</div>
        </div>
      </div>
      
      {/* Text Info and Progress */}
      {/* <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="mr-4">行数: {getTextDimensions().lines}</span>
            <span className="mr-4">最长行: {getTextDimensions().maxLineLength} 字符</span>
            <span>总字符: {currentArticle.content.length}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            进度: {Math.round((practiceState.currentIndex / currentArticle.content.length) * 100)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(practiceState.currentIndex / currentArticle.content.length) * 100}%` }}
          />
        </div>
      </div> */}
      
      {/* Unified Text Display and Input */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`w-full p-6 border-2 rounded-lg font-mono text-lg leading-relaxed whitespace-pre-wrap overflow-auto focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
          practiceState.isActive
            ? 'border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 cursor-text'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 cursor-default'
        }`}
        style={{ 
          height: `${getTextDimensions().height}px`,
          maxHeight: '800px',
          width: '100%',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {practiceState.isActive ? (
          <div className="select-none leading-7">
            {renderText()}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-center py-20">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl mb-2">点击"开始练习"开始打字</p>
            <p className="text-sm">练习开始后，直接在此区域输入即可</p>
            <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
              支持多行文本，空格键和换行符都会被正确处理
            </p>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">
          <strong>模式：</strong>
          {practiceState.mode === 'strict' 
            ? '严格模式 - 错误需回退更正' 
            : '宽容模式 - 错误可继续'
          }
        </p>
        <p className="mb-2">
          <strong>状态：</strong>
          {practiceState.isActive ? '进行中' : '未开始'}
        </p>
        <p>
          <strong>操作：</strong>
          练习开始后，直接在此区域输入文字。使用退格键删除错误，Esc键退出练习。
        </p>
      </div>
    </div>
  )
}

export default UnifiedTypingArea
