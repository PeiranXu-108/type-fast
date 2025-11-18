import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const useBattleSocket = () => {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 创建Socket连接
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    const socket = socketRef.current

    // 连接成功
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setConnected(true)
      setError(null)
    })

    // 连接断开
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)
    })

    // 连接错误
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setError(err.message)
      setConnected(false)
    })

    // 重连成功
    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setConnected(true)
      setError(null)
    })

    // 清理函数
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  // 发送事件
  const emit = useCallback((event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit:', event)
    }
  }, [connected])

  // 监听事件
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }, [])

  // 移除监听
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }, [])

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off
  }
}

