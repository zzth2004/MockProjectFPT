import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://677b-118-69-73-134.ngrok-free.app',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': '69420',
        },
      },
    },
  },
})
