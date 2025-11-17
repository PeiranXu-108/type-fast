import React from 'react'
import { Users, Zap, Clock, CheckCircle } from 'lucide-react'
import { useBattleStore } from '../store/battleStore.js'
import { useTranslation } from 'react-i18next'

const BattleRoom = ({
  playerName,
  setPlayerName,
  difficulty,
  setDifficulty,
  waitingCount,
  onQuickMatch,
  onReady,
  onLeave
}) => {
  const { t } = useTranslation()
  const { room, player, opponent, gameState } = useBattleStore()

  const isWaiting = gameState.status === 'waiting'
  const isMatching = gameState.status === 'matching'
  const bothReady = room?.players?.every(p => p.ready)

  return (
    <div className="card p-6">
      {/* 匹配界面 */}
      {!isWaiting && !isMatching && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('battle.player-name')}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('battle.enter-name')}
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('battle.difficulty')}
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="easy">{t('battle.easy')}</option>
              <option value="medium">{t('battle.medium')}</option>
              <option value="hard">{t('battle.hard')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('battle.waiting-players')}
              </span>
            </div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {waitingCount}
            </span>
          </div>

          <button
            onClick={onQuickMatch}
            disabled={!playerName.trim() || isMatching}
            className="w-full btn-primary py-3 text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMatching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('battle.matching')}...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                {t('battle.start-match')}
              </>
            )}
          </button>
        </div>
      )}

      {/* 等待对手界面 */}
      {isWaiting && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <Users className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {opponent ? t('battle.opponent-found') : t('battle.waiting-opponent')}
            </h3>
            {!opponent && (
              <p className="text-gray-600 dark:text-gray-400">
                {t('battle.searching')}...
              </p>
            )}
          </div>

          {/* 玩家列表 */}
          <div className="space-y-4">
            {/* 自己 */}
            <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {player.name?.[0]?.toUpperCase() || 'Y'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {player.name || 'You'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('battle.you')}
                  </div>
                </div>
              </div>
              {player.ready ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* 对手 */}
            {opponent ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {opponent.name?.[0]?.toUpperCase() || 'O'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {opponent.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('battle.opponent')}
                    </div>
                  </div>
                </div>
                {opponent.ready ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <div className="animate-pulse text-gray-400">
                  {t('battle.waiting-for-player')}...
                </div>
              </div>
            )}
          </div>

          {/* 准备按钮 */}
          {opponent && !player.ready && (
            <button
              onClick={onReady}
              className="w-full btn-primary py-3 text-lg"
            >
              {t('battle.ready')}
            </button>
          )}

          {bothReady && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-600 dark:text-green-400 font-semibold">
                {t('battle.both-ready')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('battle.game-starting')}...
              </p>
            </div>
          )}

          <button
            onClick={onLeave}
            className="w-full btn-secondary py-2"
          >
            {t('battle.leave-room')}
          </button>
        </div>
      )}
    </div>
  )
}

export default BattleRoom

