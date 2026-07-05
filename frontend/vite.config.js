import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Build optimization
  build: {
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Chunk strategy for better code splitting
        manualChunks(id) {
          // Vendor libraries — separate chunks for parallel loading
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('react-hook-form')) return 'vendor-form';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('zod')) return 'vendor-validation';
            if (id.includes('react-router-dom')) return 'vendor-router';
            return 'vendor';
          }
          
          // Feature chunks — improves initial load by lazy loading
          if (id.includes('/components/charts/')) return 'chunks-charts';
          if (id.includes('/components/ui/')) return 'chunks-ui';
          if (id.includes('/components/leaderboard/')) return 'chunks-leaderboard';
          if (id.includes('/components/organisation/')) return 'chunks-organisation';
          if (id.includes('/pages/')) return 'chunks-pages';
          if (id.includes('/services/')) return 'chunks-services';
        },
      },
    },
    
    // Performance monitoring
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500, // 500KB warning threshold
  },
  
  // Dev server
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  
  // CSS optimization
  css: {
    preprocessorOptions: {
      // Optimize CSS
    },
  },

  // Vite optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
    ],
    exclude: ['@vite/client'], // Don't optimize Vite's own modules
  },
})

