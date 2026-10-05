import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // localhost (`npm run dev`) — с корня; прод-сборка — под GitHub Pages
  base: command === 'build' ? '/snapa-study/' : '/',
  plugins: [react(), tailwindcss()],
  // свой порт: 5173–5175 заняты другими проектами; strictPort — не уезжать молча на соседний
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  preview: { host: '127.0.0.1', port: 5181, strictPort: true },
}))
