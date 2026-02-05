import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './',
  publicDir: 'public',
  server: {
    port: parseInt(process.env.VITE_PORT, 10) || 5050,
    strictPort: true,
    host: '0.0.0.0',
    open: false,
    hmr: false,
    headers: {
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true
  }
})