import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store.js'
import { calculateCPM, calculateAccuracy, calculateWPMFromText, formatDuration } from '../utils.js'
import Grade from '../modals/grade.jsx'
import { useTranslation } from 'react-i18next'
import { matchesShortcut } from '../utils/shortcuts.js'
import { HeadPoseDetector } from '../lib/headPoseDetector.js'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
const TypingArea = () => {
  const { t } = useTranslation()
  const { currentArticle, practiceState, updatePracticeState, saveRecord, settings } = useStore()
  const [startTime, setStartTime] = useState(null)
  const [realTimeStats, setRealTimeStats] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100
  })
  const [showGrade, setShowGrade] = useState(false)
  const [finalStats, setFinalStats] = useState(null)
  const [strictModeErrors, setStrictModeErrors] = useState([]) // Track errors in strict mode
  const [headPoseStatus, setHeadPoseStatus] = useState('disabled')
  const [headPoseError, setHeadPoseError] = useState('')
  const [downSince, setDownSince] = useState(null)
  
  const containerRef = useRef(null)
  const statsIntervalRef = useRef(null)
  const detectorRef = useRef(null)
  const headPoseSettings = useMemo(
    () => settings?.headPoseTraining || {},
    [settings?.headPoseTraining]
  )

  const formatMetric = (value) => Number(value || 0).toFixed(2)
  
  // Add sound refs instead
  const keyPressSound = useRef(null)
  const completionSound = useRef(null)

  // Preload sounds
  useEffect(() => {
    keyPressSound.current = new Audio('/sounds/keypress.mp3')
    completionSound.current = new Audio('/sounds/completion.mp3')
    
    // Preload to avoid delay on first play
    keyPressSound.current.preload = 'auto'
    completionSound.current.preload = 'auto'
  }, [])

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
    } catch {
      return char
    }
  }
  
  // Focus container when practice starts and reset strict mode errors
  useEffect(() => {
    if (practiceState.isActive) {
      containerRef.current?.focus()
      // Reset strict mode errors when starting new practice
      setStrictModeErrors([])
      setDownSince(null)
    }
  }, [practiceState.isActive])

  useEffect(() => {
    const isEnabled = Boolean(headPoseSettings.enabled)
    const shouldRun = practiceState.isActive && isEnabled

    if (!shouldRun) {
      if (detectorRef.current) {
        detectorRef.current.stop()
      }
      setHeadPoseStatus(isEnabled ? 'idle' : 'disabled')
      setHeadPoseError('')
      setDownSince(null)
      return
    }

    if (!detectorRef.current) {
      detectorRef.current = new HeadPoseDetector({
        samplingMs: headPoseSettings.samplingMs
      })
    }

    const unsubscribe = detectorRef.current.subscribe((nextStatus) => {
      if (nextStatus === 'down') {
        setDownSince((previous) => previous ?? Date.now())
      } else {
        setDownSince(null)
      }
      setHeadPoseStatus(nextStatus)
    })

    detectorRef.current.start().catch((error) => {
      console.warn('Head pose detector start failed:', error)
      const autoDisable = headPoseSettings.autoDisableOnCameraError !== false
      if (autoDisable) {
        const currentHeadPoseSettings = useStore.getState().settings?.headPoseTraining || {}
        useStore.getState().updateSettings({
          headPoseTraining: {
            ...currentHeadPoseSettings,
            enabled: false
          }
        })
      }
      setHeadPoseStatus('disabled')
      setHeadPoseError(t('practice-control.headpose-camera-error'))
    })

    return () => {
      unsubscribe()
      if (detectorRef.current) {
        detectorRef.current.stop()
      }
    }
  }, [
    practiceState.isActive,
    headPoseSettings,
    t
  ])
  
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

    const gracePeriodMs = headPoseSettings.gracePeriodMs || 1000
    const isHeadPoseGateEnabled = Boolean(headPoseSettings.enabled)
    const shouldBlockInput =
      isHeadPoseGateEnabled &&
      headPoseStatus === 'down' &&
      downSince !== null &&
      Date.now() - downSince >= gracePeriodMs

    if (shouldBlockInput) {
      return
    }
    
    const expectedChar = currentArticle.content[practiceState.currentIndex]
    const pressedChar = e.key
    
    // Handle shortcuts (user configurable)
    const shortcuts = settings?.shortcuts || {}

    if (matchesShortcut(e, shortcuts.exitPractice)) {
      useStore.getState().stopPractice()
      return
    }

    if (matchesShortcut(e, shortcuts.restartPractice)) {
      if (currentArticle) {
        useStore.getState().startPractice(currentArticle, practiceState.mode)
      }
      return
    }

    if (matchesShortcut(e, shortcuts.toggleMode)) {
      const newMode = practiceState.mode === 'lenient' ? 'strict' : 'lenient'
      updatePracticeState({ mode: newMode })
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
        
        // Play key press sound if enabled
        if (settings.sounds.keyPress) {
          if (keyPressSound.current) {
            keyPressSound.current.currentTime = 0 // Reset to start
            keyPressSound.current.play().catch(() => {}) // Handle autoplay restrictions
          }
        }
        
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
        
        // Play key press sound if enabled (even on error)
        if (settings.sounds.keyPress) {
          if (keyPressSound.current) {
            keyPressSound.current.currentTime = 0 // Reset to start
            keyPressSound.current.play().catch(() => {}) // Handle autoplay restrictions
          }
        }
        
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
        
        // Play key press sound if enabled
        if (settings.sounds.keyPress) {
          if (keyPressSound.current) {
            keyPressSound.current.currentTime = 0 // Reset to start
            keyPressSound.current.play().catch(() => {}) // Handle autoplay restrictions
          }
        }
        
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
    
    // Play completion sound if enabled
    if (settings.sounds.completion) {
      if (completionSound.current) {
        completionSound.current.currentTime = 0
        completionSound.current.play().catch(() => {})
      }
    }

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
      meta: {
        headPoseTrainingEnabled: Boolean(settings?.headPoseTraining?.enabled)
      }
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

  const gracePeriodMs = headPoseSettings.gracePeriodMs || 1000
  const isHeadPoseGateEnabled = Boolean(headPoseSettings.enabled)
  const isHeadPoseBlocked =
    isHeadPoseGateEnabled &&
    headPoseStatus === 'down' &&
    downSince !== null &&
    Date.now() - downSince >= gracePeriodMs
  const isHeadPoseInGrace =
    isHeadPoseGateEnabled &&
    headPoseStatus === 'down' &&
    downSince !== null &&
    Date.now() - downSince < gracePeriodMs
  const fontSizeClass = {
    xs: 'text-base',
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl'
  }[settings?.visual?.fontSize || 'medium'] || 'text-xl'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('practice-control.practice-area')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3 sm:grid-cols-4">
        <div className="text-center">
          <div className="text-lg font-bold text-primary">
            {formatMetric(realTimeStats.wpm)}
          </div>
          <div className="text-xs text-muted-foreground">WPM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatMetric(realTimeStats.cpm)}
          </div>
          <div className="text-xs text-muted-foreground">CPM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {realTimeStats.accuracy}%
          </div>
          <div className="text-xs text-muted-foreground">{t('results.accuracy')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {practiceState.backspaces}
          </div>
          <div className="text-xs text-muted-foreground">{t('results.backspaces')}</div>
        </div>
      </div>
      
      {/* Unified Text Display and Input */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-lg border-2 p-6 font-mono ${fontSizeClass} leading-relaxed whitespace-pre-wrap overflow-auto transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          practiceState.isActive
            ? 'cursor-text border-primary/40 bg-background'
            : 'cursor-default border-border bg-muted/40'
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
          <div className="py-20 text-center text-muted-foreground">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl mb-2">{t('click-start-practice-to-start-typing')}</p>
            <p className="text-sm">{t('after-practice-starts-you-can-start-typing-here')}</p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              {t('supports-multiple-lines-of-text-space-key-and-newline-key-will-be-handled-correctly')}
            </p>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>{t('practice-control.mode')}:</strong>
          {practiceState.mode === 'strict' 
            ? t('practice-control.strict-mode-desc')
            : t('practice-control.lenient-mode-desc')
          }
        </p>
        <p className="mb-2">
          <strong>{t('practice-control.headpose-training')}:</strong>{' '}
          {isHeadPoseGateEnabled
            ? headPoseStatus === 'down'
              ? t('practice-control.headpose-status-down')
              : headPoseStatus === 'up'
                ? t('practice-control.headpose-status-up')
                : t('practice-control.headpose-status-checking')
            : t('practice-control.headpose-status-disabled')}
        </p>
        {isHeadPoseGateEnabled && isHeadPoseInGrace ? (
          <p className="mb-2 text-amber-600 dark:text-amber-400">
            {t('practice-control.headpose-grace-active')}
          </p>
        ) : null}
        {isHeadPoseGateEnabled && isHeadPoseBlocked ? (
          <p className="mb-2 text-red-600 dark:text-red-400">
            {t('practice-control.headpose-input-blocked')}
          </p>
        ) : null}
        {headPoseError ? (
          <p className="mb-2 text-amber-600 dark:text-amber-400">{headPoseError}</p>
        ) : null}
        {/* <p className="mb-2">  
          <strong>{t('practice-control.status')}:</strong>
          {practiceState.isActive ? t('practice-control.in-progress') : t('practice-control.not-started')}
        </p>
        <p>
          <strong>{t('practice-control.operation')}:</strong>
          {t('practice-control.after-practice-starts-you-can-start-typing-here')}
        </p> */}
      </div>
      </CardContent>

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
    </Card>
  )
}

export default TypingArea
