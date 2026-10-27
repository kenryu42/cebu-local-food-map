import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? '/cebu-local-food-map/' 
    : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 5174,
    host: true
  }
});
