import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 👇 important so CSS/JS are loaded correctly when deployed
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
})