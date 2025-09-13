import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'

// Generate SHA-256 hash for content
export const generateHash = (content) => {
  return CryptoJS.SHA256(content).toString()
}

// Generate UUID
export const generateId = () => {
  return uuidv4()
}

// Calculate WPM (Words Per Minute)
export const calculateWPM = (charCount, durationMs, method = 'word-based') => {
  if (durationMs === 0) return 0
  
  const durationMinutes = durationMs / (1000 * 60)
  
  if (method === 'char-based') {
    // 5 characters = 1 word (standard typing test method)
    return Math.round((charCount / 5) / durationMinutes)
  } else {
    // Word-based calculation - count actual words from the text
    // For WPM calculation, we need to count words in the completed portion
    // Since charCount represents completed characters, we need to extract words from that portion
    
    // This is a simplified approach - in practice, you'd want to pass the actual text content
    // For now, we'll use the standard 5 characters = 1 word as a fallback
    const estimatedWords = Math.floor(charCount / 5)
    
    // Handle very short durations to avoid extreme WPM values
    if (durationMinutes < 0.1) { // Less than 6 seconds
      return Math.round(estimatedWords * 60 / (durationMs / 1000)) // Convert to per-second then scale
    }
    
    return Math.round(estimatedWords / durationMinutes)
  }
}

// Calculate WPM based on actual text content and completed characters
export const calculateWPMFromText = (text, completedChars, durationMs) => {
  if (!text || durationMs <= 0 || completedChars <= 0) return 0

  const durationMinutes = durationMs / (1000 * 60)
  const completedText = text.slice(0, completedChars)

  // Helper: estimate if content is primarily CJK (no spaces, word boundary is unclear)
  const cjkRegex = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/
  const hasWhitespace = /\s/.test(completedText)
  let cjkCount = 0
  for (let i = 0; i < completedText.length; i++) {
    if (cjkRegex.test(completedText[i])) cjkCount++
  }
  const cjkRatio = cjkCount / completedText.length

  // Prefer true word counting when spaces exist and text isn't mostly CJK
  let wordCount
  if (hasWhitespace && cjkRatio < 0.4) {
    // Count only fully completed words: drop trailing partial if no trailing whitespace
    const endsWithSpace = /\s$/.test(completedText)
    const tokens = completedText.trim().split(/\s+/).filter(Boolean)
    wordCount = tokens.length - (endsWithSpace ? 0 : 1)
    if (wordCount < 0) wordCount = 0
  } else {
    // Fallback to standard typing-test convention: 5 chars = 1 word
    wordCount = completedChars / 5
  }

  // Return integer WPM for internal use; callers format as needed
  return Math.round(wordCount / durationMinutes)
}

// Calculate CPM (Characters Per Minute)
export const calculateCPM = (charCount, durationMs) => {
  if (durationMs === 0) return 0
  
  const durationMinutes = durationMs / (1000 * 60)
  return Math.round(charCount / durationMinutes)
}

// Calculate accuracy percentage
export const calculateAccuracy = (correctChars, totalKeystrokes) => {
  if (totalKeystrokes === 0) return 100.00
  return Number(((correctChars / totalKeystrokes) * 100).toFixed(2))
}

// Count words in text
export const countWords = (text) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Count characters in text
export const countCharacters = (text) => {
  if (!text) return 0
  return text.length
}

// Format time duration
export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}.${Math.floor((ms % 1000) / 10).toString().padStart(2, '0')}`
  }
}

// Format WPM with one decimal place
export const formatWPM = (wpm) => {
  return wpm.toFixed(1)
}

// Get user agent string
export const getUserAgent = () => {
  return navigator.userAgent
}

// Check if device is mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate sample articles
export const generateSampleArticles = () => {
  return [
    {
      id: 'sample-1',
      title: 'The Power of Persistence',
      content: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Every great achievement was once considered impossible. The difference between the impossible and the possible lies in determination.',
      category: 'quote',
      difficulty: 'medium',
      wordCount: 35
    },
    {
      id: 'sample-2',
      title: 'Technology and Innovation',
      content: 'Innovation distinguishes between a leader and a follower. Technology is best when it brings people together. The future belongs to those who believe in the beauty of their dreams.',
      category: 'technical',
      difficulty: 'easy',
      wordCount: 28
    },
    {
      id: 'sample-3',
      title: 'Mindfulness and Growth',
      content: 'The mind is everything. What you think you become. Growth is the only evidence of life. Mindfulness is the practice of purposely focusing your attention on the present moment.',
      category: 'short',
      difficulty: 'medium',
      wordCount: 32
    }
  ]
}

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}
