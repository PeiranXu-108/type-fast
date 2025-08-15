import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateHash, generateId, storage } from './utils.js'

// Create store with persistence
export const useStore = create(
  persist(
    (set, get) => ({
      // Articles state
      articles: [],
      
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
        }
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
        records: state.records,
        settings: state.settings
      })
    }
  )
)
