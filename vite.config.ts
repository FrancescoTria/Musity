import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
