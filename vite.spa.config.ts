import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const base = process.env.VITE_PUBLIC_BASE ?? '/lumify-ui/'

export default defineConfig({
  base,
  plugins: [tsconfigPaths(), tailwindcss(), react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      'node:async_hooks': path.resolve(__dirname, 'src/empty.js'),
      'node:fs': path.resolve(__dirname, 'src/empty.js'),
      fs: path.resolve(__dirname, 'src/empty.js'),
    },
  },
})
