import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use absolute path for Netlify deployment
  base: '/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.2.1'),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(process.env.VITE_GIT_COMMIT || 'unknown'),
  },
  build: {
    // Ensure proper asset handling
    assetsDir: 'assets',
    sourcemap: false,
    // Disable compression in Vite to let Netlify handle it
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    // Allow microphone access in development
    headers: {
      'Permissions-Policy': 'microphone=(self)'
    }
  }
})
