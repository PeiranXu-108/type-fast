// Article interface
export const Article = {
  id: '', // sha256(content)
  title: '', // user-defined or first sentence truncated
  content: '',
  createdAt: 0,
  wordCount: 0,
  charCount: 0
}

// Practice record interface
export const PracticeRecord = {
  id: '', // uuid
  articleId: '',
  mode: 'lenient', // 'lenient' | 'strict'
  durationMs: 0,
  startedAt: 0,
  endedAt: 0,
  wpm: 0,
  cpm: 0,
  accuracy: 0, // 0~1
  totalKeystrokes: 0,
  backspaces: 0,
  errors: [], // Array<{ index: number; expected: string; actual: string }>
  meta: { ua: '', notes: '' }
}

// Practice state interface
export const PracticeState = {
  isActive: false,
  isPaused: false,
  currentIndex: 0,
  startTime: 0,
  pauseTime: 0,
  totalPauseTime: 0,
  mode: 'lenient', // 'lenient' | 'strict'
  errors: [],
  strictModeErrors: [], // number[] — indices with uncorrected errors in strict mode
  backspaces: 0,
  keystrokes: 0
}

// Settings interface
export const Settings = {
  theme: 'system', // 'light' | 'dark' | 'system' | 'eye-care'
  wpmCalculation: 'word-based', // 'char-based' | 'word-based'
  defaultMode: 'lenient', // 'lenient' | 'strict'
  sounds: {
    keyPress: true,
    completion: true
  },
  visual: {
    fontSize: 'medium', // 'xs' | 'small' | 'medium' | 'large' | 'xl'
    fontFamily: 'jetbrains-mono', // 'jetbrains-mono' | 'fira-code' | 'source-code-pro' | 'ibm-plex-mono' | 'pacifico' | 'caveat'
    lineHeight: 'normal', // 'tight' | 'normal' | 'loose'
    cursorStyle: 'block', // 'block' | 'line' | 'underline'
    contrastEnhance: false,
    themeColor: 'blue' // 'blue' | 'green' | 'orange' | 'rose' | 'violet' | 'amber' | 'teal' | 'slate'
  }
}

// Sample article interface
export const SampleArticle = {
  id: '',
  title: '',
  content: '',
  category: '', // 'quote' | 'short' | 'technical'
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
  wordCount: 0
}
