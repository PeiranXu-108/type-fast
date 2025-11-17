import React from 'react'
import { useTranslation } from 'react-i18next'
import { useBattleStore } from '../store/battleStore.js'

const OpponentProgress = ({ progress }) => {
  const { t } = useTranslation()
  const { gameState } = useBattleStore()
  
  if (!progress) return null
  
  const article = gameState.article
  const progressPercent = article && progress.currentIndex > 0 
    ? Math.min(100, (progress.currentIndex / article.content.length) * 100)
    : 0

  return (
    <div className="card p-4 bg-purple-50 dark:bg-purple-900/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          {t('battle.opponent-progress')}
        </h3>
        <span className="text-xs text-purple-600 dark:text-purple-400">
          {progress.currentIndex || 0} / {article?.content.length || 0}
        </span>
      </div>
      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3">
        <div
          className="bg-purple-600 dark:bg-purple-400 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

export default OpponentProgress

