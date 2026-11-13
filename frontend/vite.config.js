import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: './' ,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // 用 127.0.0.1：localhost 在 Windows 上会先解析成 ::1，
        // 如果 ::1:3001 被别的进程占用，代理会打到错误的服务上（表现为接口 500）
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
})