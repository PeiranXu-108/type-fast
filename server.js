/**
 * 后端服务器 - 增强版（支持PK模式）
 * 用于生产环境代理豆包 API 请求，解决 CORS 问题
 * 集成 Socket.IO 实现实时双人对战功能
 */

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { createProxyMiddleware } from 'http-proxy-middleware'
import SocketHandlers from './socket/socketHandlers.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// 创建HTTP服务器
const httpServer = createServer(app)

// 创建Socket.IO服务器
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// 启用CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))

// 解析JSON请求体
app.use(express.json())

// 代理豆包API（现有功能）
app.use(
  '/api/doubao',
  createProxyMiddleware({
    target: 'https://ark.cn-beijing.volces.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/doubao': '/api/v3/chat/completions',
    },
    onProxyReq: (proxyReq, req, res) => {
      const apiKey = process.env.VITE_DOUBAO_API_KEY || process.env.DOUBAO_API_KEY
      if (apiKey) {
        proxyReq.setHeader('Authorization', `Bearer ${apiKey}`)
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err)
      res.status(500).json({ error: 'Proxy error', message: err.message })
    },
  })
)

// Socket.IO处理
new SocketHandlers(io)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    socket: {
      connected: io.engine.clientsCount
    }
  })
})

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`🌐 CORS enabled for: ${CLIENT_URL}`)
})

