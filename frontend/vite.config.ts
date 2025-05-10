import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:5000'
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Reduce chunk size warnings limit
    chunkSizeWarningLimit: 1000,
  },
  // Uncomment and set if deploying to a subpath:
  // base: '/your-subpath/',
})
