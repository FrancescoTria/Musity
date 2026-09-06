import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/apple-music': {
        target: 'https://rss.marketingtools.apple.com',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/apple-music/, ''),
      },
    },
  },
  preview: {
    proxy: {
      '/api/apple-music': {
        target: 'https://rss.marketingtools.apple.com',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/apple-music/, ''),
      },
    },
  },
})
