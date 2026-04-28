import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Patient-Drug-Tracking-Calendar/',
  plugins: [react()],
})
