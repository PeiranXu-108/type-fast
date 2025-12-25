import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateHash, generateId, storage } from './utils.js'
import { DEFAULT_SHORTCUTS } from './utils/shortcuts.js'

const DEFAULT_SETTINGS = {
  theme: 'system',
  wpmCalculation: 'word-based',
  defaultMode: 'lenient',
  sounds: {
    keyPress: true,
    completion: true
  },
  visual: {
    fontSize: 'medium',
    lineHeight: 'normal',
    cursorStyle: 'block',
    contrastEnhance: false
  },
  shortcuts: DEFAULT_SHORTCUTS
}

// Create store with persistence
export const useStore = create(
  persist(
    (set, get) => ({
      // Articles state
      articles: [],
      
      // User custom articles state
      customArticles: [],
      
      // Practice records state
      records: {},
      
      // Current practice state
      currentArticle: null,
      practiceState: {
        isActive: false,
        currentIndex: 0,
        startTime: 0,
        mode: 'lenient',
        errors: [],
        backspaces: 0,
        keystrokes: 0
      },
      
      // Settings
      settings: {
        ...DEFAULT_SETTINGS
      },
      
      // UI state
      ui: {
        currentTab: 'practice',
        showResults: false
      },
      
      // Actions
      
      // Article actions
      addArticle: (title, content) => {
        const id = generateHash(content)
        const exists = get().articles.find(a => a.id === id);
        if(exists) return exists;
        const article = {
          id,
          title: title || content.substring(0, 50) + '...',
          content,
          createdAt: Date.now(),
          wordCount: content.trim().split(/\s+/).filter(word => word.length > 0).length,
          charCount: content.length
        }
        
        set((state) => ({
          articles: [...state.articles, article]
        }))
        
        return article
      },
      
      addCustomArticle: (title, content, category = 'custom') => {
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const article = {
          id,
          title: title.trim(),
          content: content.trim(),
          category,
          createdAt: Date.now(),
          wordCount: content.trim().split(/\s+/).filter(word => word.length > 0).length,
          charCount: content.length
        }
        
        set((state) => ({
          customArticles: [...state.customArticles, article]
        }))
        
        return article
      },
      
      updateArticle: (id, updates) => {
        set((state) => ({
          articles: state.articles.map(article =>
            article.id === id ? { ...article, ...updates } : article
          )
        }))
      },
      
      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter(article => article.id !== id),
          records: Object.fromEntries(
            Object.entries(state.records).filter(([key]) => !key.startsWith(`typer.records:${id}`))
          )
        }))
      },
      
      deleteCustomArticle: (id) => {
        set((state) => ({
          customArticles: state.customArticles.filter(article => article.id !== id)
        }))
      },
      
      updateCustomArticle: (id, updates) => {
        set((state) => ({
          customArticles: state.customArticles.map(article =>
            article.id === id ? { ...article, ...updates } : article
          )
        }))
      },
      
      setCurrentArticle: (article) => {
        set({ currentArticle: article })
      },
      
      // Practice actions
      startPractice: (article, mode = null) => {
        const practiceMode = mode || get().settings.defaultMode
        set({
          currentArticle: article,
          practiceState: {
            isActive: true,
            currentIndex: 0,
            startTime: Date.now(),
            mode: practiceMode,
            errors: [],
            backspaces: 0,
            keystrokes: 0
          },
          ui: { ...get().ui, showResults: false }
        })
      },
      

      
      stopPractice: () => {
        set((state) => ({
          currentArticle: null,
          practiceState: {
            ...state.practiceState,
            isActive: false 
          }
        }))
      },
      
      updatePracticeState: (updates) => {
        set((state) => ({
          practiceState: { ...state.practiceState, ...updates }
        }))
      },
      
      // Record actions
      saveRecord: (record) => {
        const { currentArticle } = get()
        if (!currentArticle) return
        
        const recordId = generateId()
        const fullRecord = {
          ...record,
          id: recordId,
          articleId: currentArticle.id,
          meta: {
            ...record.meta,
            ua: navigator.userAgent
          }
        }
        
        set((state) => ({
          records: {
            ...state.records,
            [`typer.records:${currentArticle.id}`]: [
              ...(state.records[`typer.records:${currentArticle.id}`] || []),
              fullRecord
            ]
          }
        }))
        
        return fullRecord
      },
      
      deleteRecord: (articleId, recordId) => {
        set((state) => ({
          records: {
            ...state.records,
            [`typer.records:${articleId}`]: (state.records[`typer.records:${articleId}`] || []).filter(
              record => record.id !== recordId
            )
          }
        }))
      },
      
      deleteAllRecords: (articleId) => {
        set((state) => {
          const newRecords = { ...state.records }
          delete newRecords[`typer.records:${articleId}`]
          
          // Also remove the article from articles array
          const newArticles = state.articles.filter(article => article.id !== articleId)
          
          return { 
            records: newRecords,
            articles: newArticles
          }
        })
      },
      
      // Delete records for a specific article (without deleting the article itself)
      deleteArticleRecords: (articleId) => {
        set((state) => {
          const newRecords = { ...state.records }
          delete newRecords[`typer.records:${articleId}`]
          
          return { 
            records: newRecords
          }
        })
      },
      
      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }))
      },
      
      // UI actions
      setCurrentTab: (tab) => {
        set((state) => ({
          ui: { ...state.ui, currentTab: tab }
        }))
      },
      

      
      showResults: () => {
        set((state) => ({
          ui: { ...state.ui, showResults: true }
        }))
      },
      
      // Utility actions
      clearAllData: () => {
        set({
          articles: [],
          customArticles: [],
          records: {},
          currentArticle: null,
          practiceState: {
            isActive: false,
            currentIndex: 0,
            startTime: 0,
            mode: 'lenient',
            errors: [],
            backspaces: 0,
            keystrokes: 0
          }
        })
        storage.clear()
      },
      
      exportData: () => {
        const state = get()
        const data = {
          articles: state.articles,
          customArticles: state.customArticles,
          records: state.records,
          settings: state.settings,
          exportDate: new Date().toISOString()
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `type-fast-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      },
      
      importData: (data) => {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          
          if (parsed.articles && Array.isArray(parsed.articles)) {
            set({ articles: parsed.articles })
          }
          
          if (parsed.customArticles && Array.isArray(parsed.customArticles)) {
            set({ customArticles: parsed.customArticles })
          }
          
          if (parsed.records && typeof parsed.records === 'object') {
            set({ records: parsed.records })
          }
          
          if (parsed.settings && typeof parsed.settings === 'object') {
            set({ settings: { ...get().settings, ...parsed.settings } })
          }
          
          return true
        } catch (error) {
          console.error('Error importing data:', error)
          return false
        }
      }
    }),
    {
      name: 'type-fast-storage',
      partialize: (state) => ({
        articles: state.articles,
        customArticles: state.customArticles,
        records: state.records,
        settings: state.settings
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState || {}
        const persistedSettings = (p && typeof p === 'object' ? p.settings : null) || {}

        return {
          ...currentState,
          ...p,
          settings: {
            ...DEFAULT_SETTINGS,
            ...currentState.settings,
            ...persistedSettings,
            sounds: {
              ...DEFAULT_SETTINGS.sounds,
              ...(currentState.settings?.sounds || {}),
              ...(persistedSettings.sounds || {})
            },
            visual: {
              ...DEFAULT_SETTINGS.visual,
              ...(currentState.settings?.visual || {}),
              ...(persistedSettings.visual || {})
            },
            shortcuts: {
              ...DEFAULT_SETTINGS.shortcuts,
              ...(currentState.settings?.shortcuts || {}),
              ...(persistedSettings.shortcuts || {})
            }
          }
        }
      }
    }
  )
)
