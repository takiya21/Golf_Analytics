import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// hole_img フォルダを配信するカスタムミドルウェア
function serveHoleImages() {
  return {
    name: 'serve-hole-images',
    configureServer(server) {
      server.middlewares.use('/hole_img', (req, res, next) => {
        const filePath = path.join(__dirname, '..', 'hole_img', req.url)
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'image/webp')
          res.end(fs.readFileSync(filePath))
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig({
  base: '/Golf_Analytics/',
  plugins: [
    react({
      // FastRefresh最適化
      fastRefresh: true,
    }),
    serveHoleImages()
  ],
  server: {
    port: 3000,
    middlewareMode: false,
    // ファイル監視の最適化
    watch: {
      usePolling: false,
      interval: 100,
      batchDelay: 100,
      ignored: ['node_modules/**', '.git/**']
    },
    // Performance optimization
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws'
    }
  },
  // 開発環境最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: ['tesseract.js']
  },
  // Optimize build
  build: {
    minify: 'terser',
    sourcemap: false,
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    // 並列処理を有効化
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'api': ['axios']
        }
      }
    }
  },
  // Cache optimization
  cacheDir: '.vite'
})
