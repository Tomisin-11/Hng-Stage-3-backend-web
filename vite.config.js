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