import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Force cache bust: v2
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure environment variables are available to the browser
    'process.env.VITE_MS_GRAPH_CLIENT_ID': JSON.stringify(process.env.VITE_MS_GRAPH_CLIENT_ID),
    'process.env.VITE_MS_GRAPH_TENANT_ID': JSON.stringify(process.env.VITE_MS_GRAPH_TENANT_ID),
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
