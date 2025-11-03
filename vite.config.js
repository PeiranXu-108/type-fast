import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3002,
      open: true,
      proxy: {
        '/api/doubao': {
          target: 'https://ark.cn-beijing.volces.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/doubao/, '/api/v3/chat/completions'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const apiKey = env.VITE_DOUBAO_API_KEY
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`)
              }
            })
            
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err.message)
            })
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    envPrefix: 'VITE_',
  }
})
