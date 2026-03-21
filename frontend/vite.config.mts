import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react(), tailwindcss(), checker({ typescript: true })],
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
