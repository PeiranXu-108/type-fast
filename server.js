/**
 * 后端代理服务器
 * 用于生产环境代理豆包 API 请求，解决 CORS 问题
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createProxyMiddleware } from 'http-proxy-middleware'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 启用 CORS
app.use(cors())

// 解析 JSON 请求体
app.use(express.json())

// 代理豆包 API
app.use(
  '/api/doubao',
  createProxyMiddleware({
    target: 'https://ark.cn-beijing.volces.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/doubao': '/api/v3/chat/completions',
    },
    onProxyReq: (proxyReq, req, res) => {
      // 从环境变量获取 API Key 并添加到请求头
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

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})

