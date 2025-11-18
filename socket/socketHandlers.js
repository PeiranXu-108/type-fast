/**
 * Socket事件处理器
 * 处理所有Socket.IO事件
 */

import RoomManager from './roomManager.js'
import GameEngine from './gameEngine.js'

class SocketHandlers {
  constructor(io) {
    this.io = io
    this.roomManager = new RoomManager()
    this.gameEngine = new GameEngine()
    this.setupHandlers()
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id)
      
      // 快速匹配
      socket.on('quick-match', async ({ playerName, difficulty = 'medium' }) => {
        try {
          const room = this.roomManager.quickMatch(socket.id, playerName, difficulty)
          
          socket.join(room.id)
          
          socket.emit('room-joined', {
            roomId: room.id,
            room: this.serializeRoom(room, socket.id)
          })
          
          // 通知房间内其他玩家
          socket.to(room.id).emit('player-joined', {
            player: {
              id: socket.id,
              name: playerName
            },
            room: this.serializeRoom(room, socket.id)
          })
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

      // 加入指定房间
      socket.on('join-room', ({ roomId, playerName }) => {
        try {
          const room = this.roomManager.joinRoom(roomId, socket.id, playerName)
          socket.join(room.id)
          
          socket.emit('room-joined', {
            roomId: room.id,
            room: this.serializeRoom(room, socket.id)
          })
          
          socket.to(room.id).emit('player-joined', {
            player: {
              id: socket.id,
              name: playerName
            },
            room: this.serializeRoom(room, socket.id)
          })
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

      // 离开房间
      socket.on('leave-room', ({ roomId }) => {
        const room = this.roomManager.leaveRoom(socket.id)
        if (room) {
          socket.leave(roomId)
          socket.to(roomId).emit('player-left', {
            playerId: socket.id,
            room: this.serializeRoom(room, socket.id)
          })
        }
      })

      // 玩家准备
      socket.on('player-ready', ({ roomId }) => {
        try {
          const room = this.roomManager.setPlayerReady(roomId, socket.id)
          
          // 通知房间内所有玩家
          this.io.to(roomId).emit('player-ready-updated', {
            room: this.serializeRoom(room, socket.id)
          })
          
          // 如果所有玩家都准备好了，开始游戏
          if (room.state === 'starting' && room.players.length === 2) {
            setTimeout(() => {
              this.startGame(roomId)
            }, 2000) // 2秒倒计时
          }
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

      // 更新打字进度
      socket.on('typing-progress', ({ roomId, progress }) => {
        const room = this.roomManager.getRoom(roomId)
        if (!room || room.state !== 'playing') return
        
        const player = room.players.find(p => p.id === socket.id)
        if (!player) return
        
        // 验证进度
        const previousProgress = player.progress
        if (!this.gameEngine.validateProgress(room.article, progress, previousProgress)) {
          socket.emit('error', { message: 'Invalid progress detected' })
          return
        }
        
        // 更新进度
        const updatedRoom = this.roomManager.updatePlayerProgress(
          roomId,
          socket.id,
          progress
        )
        
        // 广播给对手
        const opponent = updatedRoom.players.find(p => p.id !== socket.id)
        if (opponent) {
          this.io.to(opponent.id).emit('opponent-progress', {
            progress: player.progress
          })
        }
      })

      // 游戏完成
      socket.on('game-complete', ({ roomId, result }) => {
        const room = this.roomManager.getRoom(roomId)
        if (!room) return
        
        const updatedRoom = this.roomManager.playerComplete(roomId, socket.id, result)
        
        // 通知对手
        socket.to(roomId).emit('opponent-completed', {
          playerId: socket.id,
          result
        })
        
        // 如果游戏结束，发送最终结果
        if (updatedRoom.state === 'finished') {
          this.io.to(roomId).emit('game-ended', {
            room: this.serializeRoom(updatedRoom, socket.id),
            winner: updatedRoom.winner
          })
        }
      })

      // 获取等待人数
      socket.on('get-waiting-count', ({ difficulty }) => {
        const count = this.roomManager.getWaitingCount(difficulty)
        socket.emit('waiting-count', { difficulty, count })
      })

      // 断开连接处理
      socket.on('disconnect', () => {
        const room = this.roomManager.getPlayerRoom(socket.id)
        if (room) {
          const updatedRoom = this.roomManager.leaveRoom(socket.id)
          if (updatedRoom) {
            socket.to(room.id).emit('player-left', {
              playerId: socket.id,
              room: this.serializeRoom(updatedRoom, socket.id)
            })
          }
        }
        console.log('User disconnected:', socket.id)
      })
    })
  }

  /**
   * 开始游戏
   */
  startGame(roomId) {
    const room = this.roomManager.getRoom(roomId)
    if (!room) return
    
    // 选择文章
    const article = this.gameEngine.selectArticle(room.difficulty)
    const updatedRoom = this.roomManager.setGameArticle(roomId, article)
    
    // 通知所有玩家游戏开始
    this.io.to(roomId).emit('game-started', {
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        wordCount: article.wordCount
      },
      startTime: updatedRoom.startedAt,
      room: this.serializeRoom(updatedRoom, null)
    })
  }

  /**
   * 序列化房间数据（隐藏敏感信息）
   */
  serializeRoom(room, currentPlayerId) {
    return {
      id: room.id,
      state: room.state,
      difficulty: room.difficulty,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
        progress: currentPlayerId === p.id ? p.progress : this.sanitizeProgress(p.progress),
        result: p.result
      })),
      article: room.article ? {
        id: room.article.id,
        title: room.article.title,
        content: room.article.content,
        wordCount: room.article.wordCount
      } : null,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
      winner: room.winner
    }
  }

  /**
   * 清理进度数据（防止作弊）
   */
  sanitizeProgress(progress) {
    if (!progress) return null
    return {
      currentIndex: progress.currentIndex,
      wpm: progress.wpm,
      cpm: progress.cpm,
      accuracy: progress.accuracy,
      timestamp: progress.timestamp,
      completed: progress.completed
    }
  }
}

export default SocketHandlers

