// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ctasafe/',
  root: '.', // Set to your project root
  build: {
    outDir: 'dist', // Output directory for build
  },
  server: {
    port: 5173, // Or any other port you prefer
    open: true, // Automatically open in browser
  },
});
