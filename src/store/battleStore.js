import { create } from 'zustand'

export const useBattleStore = create((set, get) => ({
  // 房间状态
  room: null,
  roomId: null,
  
  // 玩家信息
  player: {
    id: null,
    name: '',
    ready: false
  },
  
  // 对手信息
  opponent: null,
  
  // 游戏状态
  gameState: {
    status: 'idle', // idle | matching | waiting | starting | playing | finished
    article: null,
    startTime: null,
    myProgress: null,
    opponentProgress: null,
    result: null,
    winner: null
  },
  
  // UI状态
  ui: {
    showMatchModal: false,
    showResults: false,
    countdown: 0
  },
  
  // Actions
  setRoom: (room) => set({ room, roomId: room?.id }),
  
  setPlayer: (player) => set({ player }),
  
  setOpponent: (opponent) => set({ opponent }),
  
  setGameState: (updates) => set((state) => ({
    gameState: { ...state.gameState, ...updates }
  })),
  
  updateMyProgress: (progress) => set((state) => ({
    gameState: {
      ...state.gameState,
      myProgress: progress
    }
  })),
  
  updateOpponentProgress: (progress) => set((state) => ({
    gameState: {
      ...state.gameState,
      opponentProgress: progress
    }
  })),
  
  setGameResult: (result, winner) => set((state) => ({
    gameState: {
      ...state.gameState,
      status: 'finished',
      result,
      winner
    },
    ui: {
      ...state.ui,
      showResults: true
    }
  })),
  
  resetBattle: () => set({
    room: null,
    roomId: null,
    opponent: null,
    gameState: {
      status: 'idle',
      article: null,
      startTime: null,
      myProgress: null,
      opponentProgress: null,
      result: null,
      winner: null
    },
    ui: {
      showMatchModal: false,
      showResults: false,
      countdown: 0
    }
  }),
  
  setUI: (updates) => set((state) => ({
    ui: { ...state.ui, ...updates }
  }))
}))

