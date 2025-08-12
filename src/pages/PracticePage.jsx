import React, { useState, useEffect } from 'react'
import { useStore } from '../store.js'
import { generateSampleArticles } from '../utils.js'
import TextInputCard from '../components/TextInputCard.jsx'
import PracticeControl from '../components/PracticeControl.jsx'
import UnifiedTypingArea from '../components/UnifiedTypingArea.jsx'
import ResultsPanel from '../components/ResultsPanel.jsx'
import { Edit3, Trash2, X, Check } from 'lucide-react'

const PracticePage = () => {
  const {
    articles,
    currentArticle,
    practiceState,
    ui,
    addArticle,
    setCurrentArticle,
    showResults
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('custom')
  const [customText, setCustomText] = useState('')
  const [sampleArticles, setSampleArticles] = useState(generateSampleArticles())
  
  // Edit and delete states
  const [editingArticle, setEditingArticle] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [deletingArticle, setDeletingArticle] = useState(null)
  
  // Initialize with sample articles if no articles exist
  useEffect(() => {
    if (articles.length === 0) {
      sampleArticles.forEach(article => {
        addArticle(article.title, article.content)
      })
    }
  }, [])
  
  // Keyboard shortcuts for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingArticle) {
          handleEditCancel()
        } else if (deletingArticle) {
          handleDeleteCancel()
        }
      }
    }
    
    if (editingArticle || deletingArticle) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingArticle, deletingArticle])
  
  const handleStartPractice = (article, mode) => {
    setCurrentArticle(article)
    useStore.getState().startPractice(article, mode)
  }
  
  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      const article = addArticle('', customText.trim())
      setCurrentArticle(article)
      useStore.getState().startPractice(article)
      setCustomText('')
    }
  }
  
  const handleSampleArticleSelect = (article) => {
    setCurrentArticle(article)
    useStore.getState().startPractice(article)
  }
  
  const handleRecentArticleSelect = (article) => {
    setCurrentArticle(article)
    useStore.getState().startPractice(article)
  }
  
  // Edit and delete handlers
  const handleEditClick = (e, article) => {
    e.stopPropagation()
    setEditingArticle(article)
    setEditTitle(article.title)
    setEditContent(article.content)
  }
  
  const handleDeleteClick = (e, article) => {
    e.stopPropagation()
    setDeletingArticle(article)
  }
  
  const handleEditSave = () => {
    if (editTitle.trim() && editContent.trim()) {
      const updatedArticles = sampleArticles.map(article => 
        article.id === editingArticle.id 
          ? { ...article, title: editTitle.trim(), content: editContent.trim() }
          : article
      )
      setSampleArticles(updatedArticles)
      
      // Also update the store if this article is current
      if (currentArticle && currentArticle.id === editingArticle.id) {
        const updatedArticle = { ...currentArticle, title: editTitle.trim(), content: editContent.trim() }
        setCurrentArticle(updatedArticle)
      }
      
      setEditingArticle(null)
      setEditTitle('')
      setEditContent('')
    }
  }
  
  const handleEditCancel = () => {
    setEditingArticle(null)
    setEditTitle('')
    setEditContent('')
  }
  
  const handleDeleteConfirm = () => {
    if (deletingArticle) {
      const updatedArticles = sampleArticles.filter(article => article.id !== deletingArticle.id)
      setSampleArticles(updatedArticles)
      
      // Also remove from store if this article is current
      if (currentArticle && currentArticle.id === deletingArticle.id) {
        setCurrentArticle(null)
      }
      
      setDeletingArticle(null)
    }
  }
  
  const handleDeleteCancel = () => {
    setDeletingArticle(null)
  }
  
  const getRecentArticles = () => {
    // Get articles with recent practice records
    const recentArticles = articles.filter(article => {
      const records = useStore.getState().records[`typer.records:${article.id}`] || []
      return records.length > 0
    })
    
    // Sort by most recent practice
    return recentArticles.sort((a, b) => {
      const aRecords = useStore.getState().records[`typer.records:${a.id}`] || []
      const bRecords = useStore.getState().records[`typer.records:${b.id}`] || []
      
      if (aRecords.length === 0 && bRecords.length === 0) return 0
      if (aRecords.length === 0) return 1
      if (bRecords.length === 0) return -1
      
      const aLatest = Math.max(...aRecords.map(r => r.endedAt))
      const bLatest = Math.max(...bRecords.map(r => r.endedAt))
      
      return bLatest - aLatest
    }).slice(0, 5)
  }
  
  if (practiceState.isActive && currentArticle) {
    return (
      <div className="space-y-6">
        <PracticeControl />
        <UnifiedTypingArea />
        {ui.showResults && <ResultsPanel />}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          开始你的打字练习
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          选择文本或输入自定义内容，提升你的英文打字速度和准确率
        </p>
      </div>
      
      {/* Text Source Selection */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {['custom', 'samples', 'recent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tab === 'custom' && '自定义文本'}
              {tab === 'samples' && '素材库'}
              {tab === 'recent' && '近期使用'}
            </button>
          ))}
        </div>
        
        {/* Custom Text Tab */}
        {activeTab === 'custom' && (
          <TextInputCard
            value={customText}
            onChange={setCustomText}
            onSubmit={handleCustomTextSubmit}
          />
        )}
        
        {/* Sample Articles Tab */}
        {activeTab === 'samples' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleArticles.map((article) => (
              <div
                key={article.id}
                className="card p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative h-48 flex flex-col"
                onClick={() => handleSampleArticleSelect(article)}
              >
                {/* Edit and Delete buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={(e) => handleEditClick(e, article)}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded transition-colors duration-200 hover:scale-105"
                    title="编辑"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, article)}
                    className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded transition-colors duration-200 hover:scale-105"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <h3 
                  className="font-semibold text-gray-900 dark:text-white mb-2 pr-16 text-base leading-tight truncate" 
                  title={article.title}
                >
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 flex-1">
                  {article.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                  <span className="capitalize">{article.category}</span>
                  <span className='bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs'>{article.wordCount} 词</span>
                  {/* <span className={`px-2 py-1 rounded-full text-xs ${
                    article.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    article.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {article.difficulty === 'easy' ? '简单' : article.difficulty === 'medium' ? '中等' : '困难'}
                  </span> */}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Recent Articles Tab */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {getRecentArticles().length > 0 ? (
              getRecentArticles().map((article) => {
                const records = useStore.getState().records[`typer.records:${article.id}`] || []
                const bestRecord = records.reduce((best, current) => 
                  current.wpm > best.wpm ? current : best, records[0] || { wpm: 0 }
                )
                const lastRecord = records[records.length - 1]
                
                return (
                  <div
                    key={article.id}
                    className="card p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleRecentArticleSelect(article)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {bestRecord && (
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs">
                            最佳: {bestRecord.wpm} WPM
                          </span>
                        )}
                        {lastRecord && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                            最近: {lastRecord.wpm} WPM
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {article.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{article.wordCount} 词</span>
                      <span>练习 {records.length} 次</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>还没有练习记录</p>
                <p className="text-sm">开始练习一些文章吧！</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                编辑文章
              </h3>
              <button
                onClick={handleEditCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="输入文章标题"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="输入文章内容"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deletingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    确认删除
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    此操作无法撤销
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                确定要删除文章 <span className="font-semibold">"{deletingArticle.title}"</span> 吗？
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticePage
