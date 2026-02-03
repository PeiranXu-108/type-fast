import React, { useState, useEffect } from 'react'
import { useBattleSocket } from '../hooks/useBattleSocket.js'
import { useBattleStore } from '../store/battleStore.js'
import BattleRoom from '../components/BattleRoom.jsx'
import BattleTypingArea from '../components/BattleTypingArea.jsx'
import BattleResults from '../components/BattleResults.jsx'
import { useTranslation } from 'react-i18next'
import { Wifi, WifiOff } from 'lucide-react'

const BattlePage = () => {
  const { t } = useTranslation()
  const { socket, connected, emit, on, off } = useBattleSocket()
  const {
    room,
    player,
    opponent,
    gameState,
    ui,
    setRoom,
    setPlayer,
    setOpponent,
    setGameState,
    updateOpponentProgress,
    setGameResult,
    resetBattle,
    setUI
  } = useBattleStore()

  const [playerName, setPlayerName] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [waitingCount, setWaitingCount] = useState(0)

  // 初始化玩家ID
  useEffect(() => {
    if (socket && connected && !player.id) {
      setPlayer({ 
        id: socket.id, 
        name: playerName || `Player_${socket.id.slice(0, 6)}`,
        ready: false 
      })
    }
  }, [socket, connected, player.id])

  // Socket事件监听
  useEffect(() => {
    if (!socket || !connected) return

    // 房间加入成功
    const handleRoomJoined = ({ roomId, room: roomData }) => {
      setRoom(roomData)
      setGameState({ status: 'waiting' })
      setUI({ showMatchModal: false })
      
      // 设置对手
      const otherPlayer = roomData.players.find(p => p.id !== socket.id)
      if (otherPlayer) {
        setOpponent(otherPlayer)
      }
    }

    // 玩家加入
    const handlePlayerJoined = ({ player: newPlayer, room: roomData }) => {
      setRoom(roomData)
      setOpponent(newPlayer)
    }

    // 玩家离开
    const handlePlayerLeft = ({ playerId, room: roomData }) => {
      setRoom(roomData)
      if (playerId === opponent?.id) {
        setOpponent(null)
      }
    }

    // 玩家准备状态更新
    const handlePlayerReadyUpdated = ({ room: roomData }) => {
      setRoom(roomData)
      // 更新自己的准备状态
      const me = roomData.players.find(p => p.id === socket.id)
      if (me) {
        setPlayer({ ...player, ready: me.ready })
      }
      // 更新对手准备状态
      const opp = roomData.players.find(p => p.id !== socket.id)
      if (opp) {
        setOpponent(opp)
      }
    }

    // 游戏开始
    const handleGameStarted = ({ article, startTime, room: roomData }) => {
      setGameState({
        status: 'playing',
        article,
        startTime
      })
      setRoom(roomData)
      
      // 倒计时
      let countdown = 3
      setUI({ countdown })
      const countdownInterval = setInterval(() => {
        countdown--
        if (countdown > 0) {
          setUI({ countdown })
        } else {
          clearInterval(countdownInterval)
          setUI({ countdown: 0 })
        }
      }, 1000)
    }

    // 对手进度更新
    const handleOpponentProgress = ({ progress }) => {
      updateOpponentProgress(progress)
    }

    // 对手完成
    const handleOpponentCompleted = ({ playerId, result }) => {
      console.log('Opponent completed:', result)
      updateOpponentProgress({ ...result, completed: true })
    }

    // 游戏结束
    const handleGameEnded = ({ room: roomData, winner }) => {
      setGameResult(null, winner)
      setRoom(roomData)
    }

    // 错误处理
    const handleError = ({ message }) => {
      console.error('Socket error:', message)
      alert(message)
    }

    // 等待人数
    const handleWaitingCount = ({ difficulty: diff, count }) => {
      if (diff === difficulty) {
        setWaitingCount(count)
      }
    }

    // 注册事件监听
    on('room-joined', handleRoomJoined)
    on('player-joined', handlePlayerJoined)
    on('player-left', handlePlayerLeft)
    on('player-ready-updated', handlePlayerReadyUpdated)
    on('game-started', handleGameStarted)
    on('opponent-progress', handleOpponentProgress)
    on('opponent-completed', handleOpponentCompleted)
    on('game-ended', handleGameEnded)
    on('error', handleError)
    on('waiting-count', handleWaitingCount)

    return () => {
      off('room-joined', handleRoomJoined)
      off('player-joined', handlePlayerJoined)
      off('player-left', handlePlayerLeft)
      off('player-ready-updated', handlePlayerReadyUpdated)
      off('game-started', handleGameStarted)
      off('opponent-progress', handleOpponentProgress)
      off('opponent-completed', handleOpponentCompleted)
      off('game-ended', handleGameEnded)
      off('error', handleError)
      off('waiting-count', handleWaitingCount)
    }
  }, [socket, connected, opponent, difficulty, player])

  // 快速匹配
  const handleQuickMatch = () => {
    if (!playerName.trim()) {
      alert(t('battle.enter-name'))
      return
    }
    
    setPlayer({ ...player, name: playerName.trim() })
    setGameState({ status: 'matching' })
    emit('quick-match', {
      playerName: playerName.trim(),
      difficulty
    })
    
    // 获取等待人数
    emit('get-waiting-count', { difficulty })
  }

  // 准备游戏
  const handleReady = () => {
    if (room?.id) {
      emit('player-ready', { roomId: room.id })
    }
  }

  // 离开房间
  const handleLeaveRoom = () => {
    if (room?.id) {
      emit('leave-room', { roomId: room.id })
      resetBattle()
    }
  }

  // 重新匹配
  const handleRematch = () => {
    resetBattle()
    setPlayerName('')
  }

  if (!connected) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('battle.connecting')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('battle.connecting-to-server')}...
          </p>
        </div>
      </div>
    )
  }

  // 游戏进行中
  if (gameState.status === 'playing') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('battle.battle-in-progress')}
          </h1>
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('battle.connected')}
            </span>
          </div>
        </div>
        <BattleTypingArea
          socket={socket}
          emit={emit}
          on={on}
          off={off}
        />
      </div>
    )
  }

  // 游戏结束
  if (gameState.status === 'finished' && ui.showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('battle.battle-completed')}
          </h1>
        </div>
        <BattleResults
          onRematch={handleRematch}
          onLeave={handleLeaveRoom}
        />
      </div>
    )
  }

  // 匹配/等待界面
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('battle.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('battle.subtitle')}
        </p>
      </div>

      <BattleRoom
        playerName={playerName}
        setPlayerName={setPlayerName}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        waitingCount={waitingCount}
        onQuickMatch={handleQuickMatch}
        onReady={handleReady}
        onLeave={handleLeaveRoom}
      />
    </div>
  )
}

export default BattlePage

