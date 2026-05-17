import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署时仓库名作为子路径
  // 如果你的仓库名是 "frontend"，base 就是 '/frontend/'
  // 如果是 username.github.io 根域名部署，base 改为 '/'
  base: '/kitchen/',
  server: {
    port: 5174,
  },
})
