/**
 * 房间管理系统
 * 管理所有PK房间的创建、加入、状态维护
 */

class RoomManager {
  constructor() {
    this.rooms = new Map() // roomId -> Room
    this.waitingRooms = new Map() // difficulty -> [roomId]
    this.playerToRoom = new Map() // socketId -> roomId
    this.cleanupInterval = null
    
    // 启动清理任务
    this.startCleanup()
  }

  /**
   * 创建房间
   */
  createRoom(playerId, playerName, difficulty = 'medium') {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const room = {
      id: roomId,
      players: [{
        id: playerId,
        name: playerName,
        socketId: playerId,
        ready: false,
        progress: null,
        result: null
      }],
      difficulty,
      state: 'waiting', // waiting | starting | playing | finished
      article: null,
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null,
      winner: null
    }
    
    this.rooms.set(roomId, room)
    this.playerToRoom.set(playerId, roomId)
    
    // 加入等待队列
    if (!this.waitingRooms.has(difficulty)) {
      this.waitingRooms.set(difficulty, [])
    }
    this.waitingRooms.get(difficulty).push(roomId)
    
    return room
  }

  /**
   * 加入房间
   */
  joinRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new Error('Room not found')
    }
    
    if (room.players.length >= 2) {
      throw new Error('Room is full')
    }
    
    if (room.state !== 'waiting') {
      throw new Error('Room is not available')
    }
    
    // 检查是否已经在房间中
    if (room.players.some(p => p.id === playerId)) {
      return room
    }
    
    room.players.push({
      id: playerId,
      name: playerName,
      socketId: playerId,
      ready: false,
      progress: null,
      result: null
    })
    
    this.playerToRoom.set(playerId, roomId)
    
    // 从等待队列移除
    const waitingList = this.waitingRooms.get(room.difficulty)
    if (waitingList) {
      const index = waitingList.indexOf(roomId)
      if (index > -1) {
        waitingList.splice(index, 1)
      }
    }
    
    return room
  }

  /**
   * 快速匹配
   */
  quickMatch(playerId, playerName, difficulty = 'medium') {
    // 查找同难度的等待房间
    const waitingList = this.waitingRooms.get(difficulty) || []
    
    for (const roomId of waitingList) {
      const room = this.rooms.get(roomId)
      if (room && room.players.length === 1 && room.state === 'waiting') {
        return this.joinRoom(roomId, playerId, playerName)
      }
    }
    
    // 没有找到，创建新房间
    return this.createRoom(playerId, playerName, difficulty)
  }

  /**
   * 离开房间
   */
  leaveRoom(playerId) {
    const roomId = this.playerToRoom.get(playerId)
    if (!roomId) return null
    
    const room = this.rooms.get(roomId)
    if (!room) return null
    
    // 移除玩家
    room.players = room.players.filter(p => p.id !== playerId)
    this.playerToRoom.delete(playerId)
    
    // 如果房间为空，删除房间
    if (room.players.length === 0) {
      this.rooms.delete(roomId)
      const waitingList = this.waitingRooms.get(room.difficulty)
      if (waitingList) {
        const index = waitingList.indexOf(roomId)
        if (index > -1) {
          waitingList.splice(index, 1)
        }
      }
      return null
    }
    
    // 如果游戏进行中，标记为放弃
    if (room.state === 'playing') {
      room.state = 'finished'
      room.finishedAt = Date.now()
      // 对手自动获胜
      if (room.players.length > 0) {
        room.winner = room.players[0].id
      }
    }
    
    return room
  }

  /**
   * 玩家准备
   */
  setPlayerReady(roomId, playerId) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')
    
    const player = room.players.find(p => p.id === playerId)
    if (!player) throw new Error('Player not found')
    
    player.ready = true
    
    // 检查是否所有玩家都准备好了
    const allReady = room.players.every(p => p.ready)
    if (allReady && room.players.length === 2) {
      room.state = 'starting'
    }
    
    return room
  }

  /**
   * 设置游戏文章
   */
  setGameArticle(roomId, article) {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')
    
    room.article = article
    room.state = 'playing'
    room.startedAt = Date.now()
    
    return room
  }

  /**
   * 更新玩家进度
   */
  updatePlayerProgress(roomId, playerId, progress) {
    const room = this.rooms.get(roomId)
    if (!room) return null
    
    const player = room.players.find(p => p.id === playerId)
    if (!player) return null
    
    player.progress = {
      ...progress,
      timestamp: Date.now()
    }
    
    return room
  }

  /**
   * 玩家完成游戏
   */
  playerComplete(roomId, playerId, result) {
    const room = this.rooms.get(roomId)
    if (!room) return null
    
    const player = room.players.find(p => p.id === playerId)
    if (!player) return null
    
    player.result = result
    player.progress = {
      ...player.progress,
      completed: true,
      currentIndex: result.completedChars || 0
    }
    
    // 检查是否所有玩家都完成了
    const allCompleted = room.players.every(p => p.result !== null)
    if (allCompleted) {
      room.state = 'finished'
      room.finishedAt = Date.now()
      room.winner = this.calculateWinner(room)
    }
    
    return room
  }

  /**
   * 计算获胜者
   */
  calculateWinner(room) {
    if (room.players.length !== 2) return null
    
    const [p1, p2] = room.players
    
    // 优先比较WPM
    if (p1.result.wpm > p2.result.wpm) return p1.id
    if (p2.result.wpm > p1.result.wpm) return p2.id
    
    // WPM相同，比较准确率
    if (p1.result.accuracy > p2.result.accuracy) return p1.id
    if (p2.result.accuracy > p1.result.accuracy) return p2.id
    
    // 准确率相同，比较完成时间
    if (p1.result.durationMs < p2.result.durationMs) return p1.id
    if (p2.result.durationMs < p1.result.durationMs) return p2.id
    
    // 完全平局
    return 'tie'
  }

  /**
   * 获取房间信息
   */
  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  /**
   * 获取玩家所在房间
   */
  getPlayerRoom(playerId) {
    const roomId = this.playerToRoom.get(playerId)
    return roomId ? this.rooms.get(roomId) : null
  }

  /**
   * 清理过期房间
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const expireTime = 30 * 60 * 1000 // 30分钟
      
      for (const [roomId, room] of this.rooms.entries()) {
        // 清理超过30分钟的空房间或已完成房间
        if (now - room.createdAt > expireTime) {
          if (room.state === 'finished' || room.players.length === 0) {
            this.rooms.delete(roomId)
            this.waitingRooms.forEach(list => {
              const index = list.indexOf(roomId)
              if (index > -1) list.splice(index, 1)
            })
            room.players.forEach(p => {
              this.playerToRoom.delete(p.id)
            })
          }
        }
      }
    }, 5 * 60 * 1000) // 每5分钟清理一次
  }

  /**
   * 获取等待人数
   */
  getWaitingCount(difficulty) {
    const waitingList = this.waitingRooms.get(difficulty) || []
    return waitingList.length
  }
}

export default RoomManager

