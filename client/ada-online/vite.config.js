import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // Import the SSL plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Add the SSL plugin
  ],
  server: {
    https: true // Enable HTTPS
  }
})
