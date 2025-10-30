import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devtools } from '@tanstack/devtools-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devtools(), // TanStack devtools vite plugin
  ],
  base: '/tanstack-prefetch-heatmap/demo-marketplace/',
})
