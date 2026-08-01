import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 4096, // inline only small assets (icons); models always stay separate files
    rollupOptions: {
      output: {
        // Keep the heavy 3D stack in its own cacheable chunk, separate
        // from app code and from React itself - so a UI-only change
        // doesn't invalidate the (much larger, rarely-changing) three.js
        // vendor bundle in visitors' browser caches.
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/three-stdlib')) {
            return 'three';
          }
          if (id.includes('node_modules/@react-three')) {
            return 'react-three';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
