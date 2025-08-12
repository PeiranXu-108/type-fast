import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store.js'
import { calculateWPM, calculateCPM, calculateAccuracy } from '../utils.js'

const TypingArea = () => {
  const { currentArticle, practiceState, updatePracticeState, saveRecord, showResults } = useStore()
  const [inputValue, setInputValue] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [realTimeStats, setRealTimeStats] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100
  })
  
  const inputRef = useRef(null)
  const statsIntervalRef = useRef(null)
  
  // Focus input when practice starts
  useEffect(() => {
    if (practiceState.isActive) {
      inputRef.current?.focus()
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
          const wpm = calculateWPM(practiceState.currentIndex, elapsed, 'word-based')
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
  }, [practiceState.isActive, startTime, practiceState.currentIndex, practiceState.keystrokes])
  
  const handleInputChange = (e) => {
    if (!practiceState.isActive) return
    
    const value = e.target.value
    const currentChar = value[value.length - 1]
    const expectedChar = currentArticle.content[practiceState.currentIndex]
    

    
    // Handle space characters specially - normalize both current and expected chars
    const normalizedCurrentChar = currentChar === ' ' ? ' ' : currentChar
    const normalizedExpectedChar = expectedChar === ' ' ? ' ' : expectedChar
    
    if (normalizedCurrentChar === normalizedExpectedChar) {
      // Correct character
      updatePracticeState({
        currentIndex: practiceState.currentIndex + 1,
        keystrokes: practiceState.keystrokes + 1
      })
      setInputValue('')
      
      // Start timer on first correct input
      if (!startTime) {
        setStartTime(Date.now())
      }
    } else if (e.nativeEvent.inputType === 'deleteContentBackward') {
      // Backspace
      if (practiceState.mode === 'strict' && practiceState.currentIndex > 0) {
        updatePracticeState({
          currentIndex: practiceState.currentIndex - 1,
          backspaces: practiceState.backspaces + 1,
          keystrokes: practiceState.keystrokes + 1
        })
      }
      setInputValue('')
    } else if (practiceState.mode === 'lenient') {
      // Lenient mode - allow errors but track them
      const error = {
        index: practiceState.currentIndex,
        expected: expectedChar,
        actual: currentChar
      }
      
      updatePracticeState({
        currentIndex: practiceState.currentIndex + 1,
        errors: [...practiceState.errors, error],
        keystrokes: practiceState.keystrokes + 1
      })
      setInputValue('')
      
      if (!startTime) {
        setStartTime(Date.now())
      }
    }
    // In strict mode, wrong characters are ignored
  }
  
  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts during practice
    if (practiceState.isActive) {
      // Handle keyboard shortcuts
      if (e.key === 'Escape') {
        e.preventDefault()
        useStore.getState().stopPractice()
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        if (currentArticle) {
          useStore.getState().startPractice(currentArticle, practiceState.mode)
        }
      }
    }
  }
  
  const handlePracticeComplete = () => {
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    const record = {
      durationMs: totalTime,
      startedAt: startTime,
      endedAt: endTime,
      wpm: realTimeStats.wpm,
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
    setInputValue('')
    setRealTimeStats({ wpm: 0, cpm: 0, accuracy: 100 })
  }
  
  const renderText = () => {
    if (!currentArticle) return null
    
    const content = currentArticle.content
    const chars = content.split('')
    
    return chars.map((char, index) => {
      let className = 'font-mono'
      
      if (index < practiceState.currentIndex) {
        // Already typed
        const isError = practiceState.errors.some(error => error.index === index)
        className += isError ? ' typing-error' : ' typing-correct'
      } else if (index === practiceState.currentIndex) {
        // Current character
        className += ' typing-current'
      }
      
      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      )
    })
  }
  
  if (!currentArticle) return null
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Article Display */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          练习文本
        </h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-lg leading-relaxed whitespace-pre-wrap overflow-auto max-h-96">
          {renderText()}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          输入区域
        </h3>
        
        {/* Real-time Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
        
        {/* Input Field */}
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="开始输入..."
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-lg"
          disabled={!practiceState.isActive}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        
        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            <strong>模式：</strong>
            {practiceState.mode === 'strict' 
              ? '严格模式 - 错误需回退更正' 
              : '宽容模式 - 错误可继续'
            }
          </p>
          <p>
            <strong>状态：</strong>
            {practiceState.isActive ? '进行中' : '未开始'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TypingArea
