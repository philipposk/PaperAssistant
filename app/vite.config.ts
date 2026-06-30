import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@paperassistant/lib': path.resolve(__dirname, '../lib'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/semantic-scholar": {
        target: "https://api.semanticscholar.org/graph/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/semantic-scholar/, ""),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
