import { defineConfig } from 'vite';

export default defineConfig({
  define: { 'process.env': {}, global: 'globalThis' },
  build: { chunkSizeWarningLimit: 900 },
});
