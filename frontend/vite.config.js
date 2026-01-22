import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [
    react({
      // FastRefresh最適化
      fastRefresh: true,
    })
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
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/hole_img': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
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
