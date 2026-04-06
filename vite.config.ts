import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Включаем проксирование WS для всех соединений к /ws (можно заменить на свой путь)
      '/ws': {
        target: 'wss://api.xutor.online',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
