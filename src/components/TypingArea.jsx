import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store.js'
import { calculateWPM, calculateCPM, calculateAccuracy, calculateWPMFromText, formatDuration } from '../utils.js'
import Grade from '../modals/grade.jsx'
import { useTranslation } from 'react-i18next'
const TypingArea = () => {
  const { t } = useTranslation()
  const { currentArticle, practiceState, updatePracticeState, saveRecord, showResults } = useStore()
  const [startTime, setStartTime] = useState(null)
  const [realTimeStats, setRealTimeStats] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100
  })
  const [showGrade, setShowGrade] = useState(false)
  const [finalStats, setFinalStats] = useState(null)
  const [strictModeErrors, setStrictModeErrors] = useState([]) // Track errors in strict mode
  
  const containerRef = useRef(null)
  const statsIntervalRef = useRef(null)
  
  // Build error index set for O(1) lookup to avoid O(n^2) cost
  const errorIndexSet = useMemo(() => new Set([
    ...practiceState.errors.map(error => error.index),
    ...strictModeErrors
  ]), [practiceState.errors, strictModeErrors])
  
  // Normalize characters for comparison to handle various edge cases
  const normalizeChar = (char) => {
    if (!char) return char
    
    // Handle various space characters 
    if (/\s/.test(char)) return ' '

    const charMap = {
      '\uFF0C': ',',  
      '\u3002': '.',  
      '\uFF01': '!',  
      '\uFF1F': '?',  
      '\uFF1A': ':',  
      '\uFF1B': ';',  
      '\uFF08': '(',  
      '\uFF09': ')',  
      '\u3014': '[',  
      '\u3015': ']',  
      '\u300A': '<',  
      '\u300B': '>',  
      '\u2014': '-',  
      '\u2026': '...', 
      '\u2018': "'",   
      '\u2019': "'",   
      '\uFF07': "'",   
      '\u0027': "'",   
    }
    
    // Check if character is in the map
    if (charMap[char]) {
      return charMap[char]
    }
    
    // Handle other potential Unicode variations
    try {
      return char.normalize('NFKC')
    } catch (error) {
      // Fallback if normalize is not supported
      return char
    }
  }
  
  // Focus container when practice starts and reset strict mode errors
  useEffect(() => {
    if (practiceState.isActive) {
      containerRef.current?.focus()
      // Reset strict mode errors when starting new practice
      setStrictModeErrors([])
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
          
          // Calculate accuracy based on mode
          let accuracy
          if (practiceState.mode === 'strict') {
            // In strict mode, accuracy is based on highlighted errors
            const totalTyped = practiceState.currentIndex + strictModeErrors.length
            const correctChars = practiceState.currentIndex
            accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100
          } else {
            // In lenient mode, use the original calculation
            const correctChars = practiceState.currentIndex - practiceState.errors.length
            accuracy = calculateAccuracy(correctChars, practiceState.keystrokes)
          }
          
          setRealTimeStats({ wpm, cpm, accuracy })
        }
      }, 100)
      
      return () => {
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current)
        }
      }
    }
  }, [practiceState.isActive, startTime, practiceState.currentIndex, practiceState.keystrokes, currentArticle, strictModeErrors])
  
  const handleKeyDown = (e) => {
    if (!practiceState.isActive || showGrade) return
    
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
        // Remove the last error if we're going back from an error position
        if (strictModeErrors.includes(practiceState.currentIndex - 1)) {
          setStrictModeErrors(prev => prev.filter(index => index !== practiceState.currentIndex - 1))
        }
        
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
      // Normalize characters for comparison to handle various edge cases
      const normalizedPressedChar = normalizeChar(pressedChar)
      const normalizedExpectedChar = normalizeChar(expectedChar)
      
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
        // Add debug logging for punctuation issues
        if (/[^\w\s]/.test(expectedChar) || /[^\w\s]/.test(pressedChar)) {
          console.log('Punctuation mismatch:', {
            expected: expectedChar,
            actual: pressedChar,
            expectedCode: expectedChar.charCodeAt(0),
            actualCode: pressedChar.charCodeAt(0),
            expectedNormalized: normalizedExpectedChar,
            actualNormalized: normalizedPressedChar
          })
        }
        
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
      } else if (practiceState.mode === 'strict') {
        // Strict mode - mark error and prevent progression until corrected
        setStrictModeErrors(prev => [...prev, practiceState.currentIndex])
        // Don't increment currentIndex, don't add to errors array
        // Just track the keystroke
        updatePracticeState({
          keystrokes: practiceState.keystrokes + 1
        })
        
        if (!startTime) {
          setStartTime(Date.now())
        }
      }
    }
  }
  
  const handleReturn = () => {
    setShowGrade(false)
    setFinalStats(null)
    
    // Reset practice state when returning
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
    setStrictModeErrors([]) // Reset strict mode errors
  }
  
  const handlePracticeAgain = () => {
    setShowGrade(false)
    setFinalStats(null)
    
    // Reset practice state before starting again
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
    setStrictModeErrors([]) // Reset strict mode errors
    
    if (currentArticle) {
      useStore.getState().startPractice(currentArticle, practiceState.mode)
    }
  }
  
  const handlePracticeComplete = () => {
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Calculate final WPM using the same function for consistency
    const finalWpm = calculateWPMFromText(currentArticle.content, practiceState.currentIndex, totalTime)
    
    // Calculate final accuracy based on mode
    let finalAccuracy
    if (practiceState.mode === 'strict') {
      // In strict mode, accuracy is based on highlighted errors
      const totalTyped = practiceState.currentIndex + strictModeErrors.length
      const correctChars = practiceState.currentIndex
      finalAccuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100
    } else {
      // In lenient mode, use the original calculation
      const correctChars = practiceState.currentIndex - practiceState.errors.length
      finalAccuracy = calculateAccuracy(correctChars, practiceState.keystrokes)
    }
    
    
    
    const record = {
      durationMs: totalTime,
      startedAt: startTime,
      endedAt: endTime,
      wpm: finalWpm,
      cpm: realTimeStats.cpm,
      accuracy: finalAccuracy / 100,
      totalKeystrokes: practiceState.keystrokes,
      backspaces: practiceState.backspaces,
      errors: practiceState.mode === 'strict' ? strictModeErrors.map(index => ({
        index,
        expected: currentArticle.content[index],
        actual: 'incorrect'
      })) : practiceState.errors,
      meta: {}
    }
    
    saveRecord(record)
    
    // Set final stats and show grade modal FIRST
    setFinalStats({
      wpm: finalWpm,
      cpm: realTimeStats.cpm,
      duration: formatDuration(totalTime),
      accuracy: finalAccuracy
    })
    setShowGrade(true)
    
    
    // Don't reset practice state immediately - let the grade modal show first
    // We'll reset it when user clicks return or practice again
  }
  
  const renderText = () => {
    if (!currentArticle) return null
    
    const content = currentArticle.content
    const chars = content.split('')
    
    return chars.map((char, index) => {
      let className = 'font-mono inline-block'
      
      if (index < practiceState.currentIndex) {
        // Already typed
        const isError = errorIndexSet.has(index)
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
  
  // Calculate text dimensions for proper height adjustment (memoized)
  const textDimensions = useMemo(() => {
    if (!currentArticle) return { lines: 0, height: 400 }

    const content = currentArticle.content
    const lines = content.split('\n').length
    const maxLineLength = Math.max(...content.split('\n').map(line => line.length))

    // Each line ~24px height + base padding/margins
    const baseHeight = 100
    const lineHeight = 24
    const estimatedHeight = Math.max(400, Math.min(800, lines * lineHeight + baseHeight))

    return { lines, maxLineLength, height: estimatedHeight }
  }, [currentArticle?.content])
  
  if (!currentArticle) return null
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('practice-control.practice-area')}
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
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('results.accuracy')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {practiceState.backspaces}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('results.backspaces')}</div>
        </div>
      </div>
      
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
          height: `${textDimensions.height}px`,
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
            <p className="text-xl mb-2">{t('click-start-practice-to-start-typing')}</p>
            <p className="text-sm">{t('after-practice-starts-you-can-start-typing-here')}</p>
            <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
              {t('supports-multiple-lines-of-text-space-key-and-newline-key-will-be-handled-correctly')}
            </p>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">
          <strong>{t('practice-control.mode')}:</strong>
          {practiceState.mode === 'strict' 
            ? t('practice-control.strict-mode-desc')
            : t('practice-control.lenient-mode-desc')
          }
        </p>
        {/* <p className="mb-2">  
          <strong>{t('practice-control.status')}:</strong>
          {practiceState.isActive ? t('practice-control.in-progress') : t('practice-control.not-started')}
        </p>
        <p>
          <strong>{t('practice-control.operation')}:</strong>
          {t('practice-control.after-practice-starts-you-can-start-typing-here')}
        </p> */}
      </div>
      
      {/* Grade Modal */}
      {showGrade && finalStats && (
        <Grade
          wpm={finalStats.wpm}
          cpm={finalStats.cpm}
          duration={finalStats.duration}
          accuracy={finalStats.accuracy}
          onReturn={handleReturn}
          onPracticeAgain={handlePracticeAgain}
        />
      )}
    </div>
  )
}

export default TypingArea
