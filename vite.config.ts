import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  // с корня: localhost и основной сайт snapa.art-kalinin-design.ru;
  // копия на GitHub Pages собирается с BASE_PATH=/snapa-study/ (deploy.yml)
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  // библиотеки (React, GSAP, Lenis) — отдельным чанком: меняются редко,
  // и после деплоя браузер перекачивает только код сайта
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'vendor', test: /node_modules[\\/].*\.m?js$/ }],
        },
      },
    },
  },
  // свой порт: 5173–5175 заняты другими проектами; strictPort — не уезжать молча на соседний
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  preview: { host: '127.0.0.1', port: 5181, strictPort: true },
}))
