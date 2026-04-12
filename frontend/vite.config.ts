import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/cap': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // 跳过 .wasm 文件的代理，让 Vite 直接从 public 目录提供
        bypass: (req) => {
          if (req.url?.endsWith('.wasm')) {
            return req.url;
          }
        },
      },
    },
  },
})
