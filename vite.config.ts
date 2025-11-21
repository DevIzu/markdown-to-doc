import { defineConfig, loadEnv } from 'vite' // loadEnv is still needed
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The following line caused the error because the calculated variable was not used.
  // const _env = loadEnv(mode, '.', ''); 
  
  // We don't need to load env variables here if they aren't used in this config.

  return {
    plugins: [react()],
    // Define global for libraries that rely on it (like html-docx-js)
    define: {
      global: 'window',
    },
  }
})