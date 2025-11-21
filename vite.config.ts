import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode: _mode }) => { 
  
  return {
    plugins: [react()],
    // Define global for libraries that rely on it (like html-docx-js)
    define: {
      global: 'window',
    },
  }
})