import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure built assets work when served from file:// or a subpath
  base: './',
  server: {
    host: 'localhost',
    port: 5173,
    // Allow microphone access in development
    headers: {
      'Permissions-Policy': 'microphone=(self)'
    }
  }
})
