import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add any path aliases if needed
    }
  },
  // Optionally, configure asset handling
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.webp', '**/*.jpeg']
})