import React from 'react'
import { Trophy, RotateCcw, Home } from 'lucide-react'
import { useBattleStore } from '../store/battleStore.js'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../utils.js'

const BattleResults = ({ onRematch, onLeave }) => {
  const { t } = useTranslation()
  const { room, gameState, opponent, player } = useBattleStore()
  
  const myResult = gameState.myProgress
  const opponentResult = opponent?.result || gameState.opponentProgress
  const winner = gameState.winner
  
  const isWinner = winner === player.id
  const isTie = winner === 'tie'

  if (!myResult) return null

  return (
    <div className="card p-6">
      <div className="text-center mb-8">
        {isWinner && (
          <div className="mb-4">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-2 animate-bounce" />
            <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {t('battle.you-win')}!
            </h2>
          </div>
        )}
        {!isWinner && !isTie && (
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {t('battle.you-lose')}
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              {t('battle.better-luck-next-time')}
            </p>
          </div>
        )}
        {isTie && (
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {t('battle.tie')}
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              {t('battle.evenly-matched')}
            </p>
          </div>
        )}
      </div>

      {/* 对比结果 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 我的结果 */}
        <div className={`p-6 rounded-xl ${isWinner ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
          <h3 className="text-lg font-semibold mb-4 text-center">
            {t('battle.your-result')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.wpm')}</span>
              <span className="font-bold text-lg">{myResult.wpm || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.accuracy')}</span>
              <span className="font-bold text-lg">{Math.round((myResult.accuracy || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.elapsed-time')}</span>
              <span className="font-bold text-lg">
                {myResult.durationMs ? formatDuration(myResult.durationMs) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('results.error-count')}</span>
              <span className="font-bold text-lg">{myResult.errors?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* 对手结果 */}
        {opponentResult && (
          <div className={`p-6 rounded-xl ${!isWinner && !isTie ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <h3 className="text-lg font-semibold mb-4 text-center">
              {opponent?.name || t('battle.opponent')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('results.wpm')}</span>
                <span className="font-bold text-lg">{opponentResult.wpm || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('results.accuracy')}</span>
                <span className="font-bold text-lg">{Math.round((opponentResult.accuracy || 0) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('results.elapsed-time')}</span>
                <span className="font-bold text-lg">
                  {opponentResult.durationMs ? formatDuration(opponentResult.durationMs) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('results.error-count')}</span>
                <span className="font-bold text-lg">{opponentResult.errors?.length || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRematch}
          className="btn-primary px-8 py-3 text-lg flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t('battle.rematch')}
        </button>
        <button
          onClick={onLeave}
          className="btn-secondary px-8 py-3 text-lg flex items-center justify-center"
        >
          <Home className="w-5 h-5 mr-2" />
          {t('battle.back-to-lobby')}
        </button>
      </div>
    </div>
  )
}

export default BattleResults

