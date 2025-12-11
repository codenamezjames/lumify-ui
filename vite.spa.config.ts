import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const base = process.env.VITE_PUBLIC_BASE ?? '/lumify-ui/'

export default defineConfig({
  base,
  plugins: [tsconfigPaths(), tailwindcss(), react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
