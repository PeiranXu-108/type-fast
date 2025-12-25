// Keyboard shortcut utilities
//
// We store shortcuts as `{ code, ctrl, alt, shift, meta }` where `code` is
// `KeyboardEvent.code` (stable across layouts) for matching.

export const DEFAULT_SHORTCUTS = {
  startPractice: { code: 'Space', ctrl: false, alt: false, shift: false, meta: false },
  exitPractice: { code: 'Escape', ctrl: false, alt: false, shift: false, meta: false },
  restartPractice: { code: 'Enter', ctrl: true, alt: false, shift: false, meta: false },
  toggleMode: { code: 'Tab', ctrl: false, alt: false, shift: false, meta: false },
}

const MODIFIER_CODES = new Set([
  'ShiftLeft', 'ShiftRight',
  'ControlLeft', 'ControlRight',
  'AltLeft', 'AltRight',
  'MetaLeft', 'MetaRight',
])

export function isModifierOnlyShortcut(code) {
  return MODIFIER_CODES.has(code)
}

export function normalizeShortcut(shortcut) {
  if (!shortcut || typeof shortcut !== 'object') return null
  const code = shortcut.code || shortcut.key || null
  if (!code) return null
  return {
    code,
    ctrl: !!shortcut.ctrl,
    alt: !!shortcut.alt,
    shift: !!shortcut.shift,
    meta: !!shortcut.meta,
  }
}

export function shortcutsEqual(a, b) {
  const sa = normalizeShortcut(a)
  const sb = normalizeShortcut(b)
  if (!sa || !sb) return false
  return (
    sa.code === sb.code &&
    sa.ctrl === sb.ctrl &&
    sa.alt === sb.alt &&
    sa.shift === sb.shift &&
    sa.meta === sb.meta
  )
}

export function eventToShortcut(e) {
  return {
    code: e.code,
    ctrl: !!e.ctrlKey,
    alt: !!e.altKey,
    shift: !!e.shiftKey,
    meta: !!e.metaKey,
  }
}

export function matchesShortcut(e, shortcut) {
  const s = normalizeShortcut(shortcut)
  if (!s) return false
  return (
    e.code === s.code &&
    !!e.ctrlKey === !!s.ctrl &&
    !!e.altKey === !!s.alt &&
    !!e.shiftKey === !!s.shift &&
    !!e.metaKey === !!s.meta
  )
}

function codeToLabel(code) {
  if (!code) return ''
  if (code === 'Space') return 'Space'
  if (code === 'Escape') return 'Esc'
  if (code === 'Enter') return 'Enter'
  if (code === 'Tab') return 'Tab'
  if (code === 'Backspace') return 'Backspace'
  if (code === 'Delete') return 'Delete'
  if (code.startsWith('Key') && code.length === 4) return code.slice(3)
  if (code.startsWith('Digit') && code.length === 6) return code.slice(5)
  if (code.startsWith('Numpad')) return code
  if (code.startsWith('Arrow')) return code.replace('Arrow', 'Arrow ')
  return code
}

export function formatShortcut(shortcut, platform = null) {
  const s = normalizeShortcut(shortcut)
  if (!s) return ''

  const isMac = platform === 'mac' || (platform == null && typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform))
  const parts = []
  if (s.ctrl) parts.push(isMac ? 'Ctrl' : 'Ctrl')
  if (s.alt) parts.push(isMac ? 'Alt' : 'Alt')
  if (s.shift) parts.push('Shift')
  if (s.meta) parts.push(isMac ? 'Cmd' : 'Meta')
  parts.push(codeToLabel(s.code))
  return parts.join(' + ')
}


