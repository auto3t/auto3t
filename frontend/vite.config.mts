import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    base: isProduction ? '/static/' : '/',
    server: {
      port: 3000,
      open: false,
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
  }
})
