import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/moss': {
        target: 'http://default-squad.ru:24442',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moss/, '/moss'),
      },
      '/api/table': {
        target: 'http://default-squad.ru:8542',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/table/, ''),
      },
    },
  },
});
