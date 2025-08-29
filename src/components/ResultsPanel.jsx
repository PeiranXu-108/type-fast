import React from 'react'
import { Trophy, Clock, Target, TrendingUp, RotateCcw, ArrowRight } from 'lucide-react'
import { useStore } from '../store.js'
import { formatDuration, formatWPM } from '../utils.js'
import { useTranslation } from 'react-i18next'

const ResultsPanel = () => {
  const { t } = useTranslation()
  const { currentArticle, records, startPractice, setCurrentTab } = useStore()
  
  if (!currentArticle) return null
  
  const articleRecords = records[`typer.records:${currentArticle.id}`] || []
  const latestRecord = articleRecords[articleRecords.length - 1]
  
  if (!latestRecord) return null
  
  const getBestRecord = () => {
    return articleRecords.reduce((best, current) => 
      current.wpm > best.wpm ? current : best, articleRecords[0]
    )
  }
  
  const getAverageWPM = () => {
    const total = articleRecords.reduce((sum, record) => sum + record.wpm, 0)
    return Math.round(total / articleRecords.length)
  }
  
  const getImprovement = () => {
    if (articleRecords.length < 2) return 0
    const previous = articleRecords[articleRecords.length - 2]
    return latestRecord.wpm - previous.wpm
  }
  
  const handlePracticeAgain = () => {
    startPractice(currentArticle)
  }
  
  const handleViewHistory = () => {
    setCurrentTab('history')
  }
  
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return 'text-green-600 dark:text-green-400'
    if (accuracy >= 85) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  const getWPMColor = (wpm) => {
    if (wpm >= 60) return 'text-green-600 dark:text-green-400'
    if (wpm >= 40) return 'text-yellow-600 dark:text-yellow-400'
    if (wpm >= 20) return 'text-blue-600 dark:text-blue-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  return (
    <div className="card p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('results.practice-completed')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('results.practice-completed-subtitle')}
        </p>
      </div>
      
      {/* Main Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* WPM */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className={`text-4xl font-bold ${getWPMColor(latestRecord.wpm)}`}>
            {formatWPM(latestRecord.wpm)}
          </div>
          <div className="text-blue-600 dark:text-blue-400 font-medium">{t('results.wpm')}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('results.wpm-description')}
          </div>
        </div>
        
        {/* Accuracy */}
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className={`text-4xl font-bold ${getAccuracyColor(latestRecord.accuracy * 100)}`}>
            {Math.round(latestRecord.accuracy * 100)}%
          </div>
          <div className="text-green-600 dark:text-green-400 font-medium">{t('results.accuracy')}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('results.accuracy-description')}
          </div>
        </div>
        
        {/* Time */}
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {formatDuration(latestRecord.durationMs)}
          </div>
          <div className="text-purple-600 dark:text-purple-400 font-medium">{t('results.elapsed-time')}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('results.elapsed-time-description')}
          </div>
        </div>
      </div>
      
      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            {t('results.detailed-stats')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.cpm')}</span>
              <span className="font-mono font-semibold">{latestRecord.cpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.total-keystrokes')}</span>
              <span className="font-mono font-semibold">{latestRecord.totalKeystrokes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.backspaces')}</span>
              <span className="font-mono font-semibold">{latestRecord.backspaces}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.error-count')}</span>
              <span className="font-mono font-semibold">{latestRecord.errors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.practice-mode')}</span>
              <span className="font-semibold">
                {latestRecord.mode === 'strict' ? t('results.strict-mode') : t('results.lenient-mode')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('results.history-comparison')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.current-score')}</span>
              <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                {formatWPM(latestRecord.wpm)} WPM
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.best-record')}</span>
              <span className="font-mono font-semibold text-yellow-600 dark:text-yellow-400">
                {formatWPM(getBestRecord().wpm)} WPM
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.average-score')}</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {formatWPM(getAverageWPM())} WPM
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.practice-count')}</span>
              <span className="font-semibold">{articleRecords.length}</span>
            </div>
            {articleRecords.length >= 2 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('results.compared-to-last')}</span>
                <span className={`font-semibold ${getImprovement() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {getImprovement() >= 0 ? '+' : ''}{getImprovement()} WPM
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handlePracticeAgain}
          className="btn-primary px-8 py-3 text-lg flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t('results.practice-again')}
        </button>
        
        <button
          onClick={handleViewHistory}
          className="btn-secondary px-8 py-3 text-lg flex items-center justify-center"
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          {t('results.view-history')}
        </button>
      </div>
      
      {/* Encouragement */}
      <div className="text-center mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          {latestRecord.wpm >= 60 ? 
            t('results.encouragement-excellent') :
            latestRecord.wpm >= 40 ?
            t('results.encouragement-good') :
            t('results.encouragement-start')
          }
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {t('results.practice-suggestion')}
        </p>
      </div>
    </div>
  )
}

export default ResultsPanel
