import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: '/', // 用户主页仓库使用根路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
