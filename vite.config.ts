import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: '/ai-tools/', // 你的 GitHub 仓库名称
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
