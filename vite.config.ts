import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// three.js is pulled in through a dynamic import (see WorldView.vue), so it already
// ships as its own chunk and the plain-CV path never downloads it.
export default defineConfig({
  plugins: [vue()],
  build: { chunkSizeWarningLimit: 900 },
})
