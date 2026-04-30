import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // Proxy /auth/* to backend BUT exclude /auth/callback
      // which is a frontend React route handled by the browser
      '/auth/github': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/auth/refresh': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/auth/logout': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/auth/me': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
