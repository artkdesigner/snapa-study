import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // localhost (`npm run dev`) — с корня; прод-сборка — под GitHub Pages
  base: command === 'build' ? '/snapa-study/' : '/',
  plugins: [react(), tailwindcss()],
}))
