import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use '.' instead of process.cwd() to avoid TypeScript errors.
  const _env = loadEnv(mode, '.', ''); // Renamed 'env' to '_env'

  return {
    plugins: [react()],
    // Define global for libraries that rely on it (like html-docx-js)
    define: {
      global: 'window',
    },
  }
})