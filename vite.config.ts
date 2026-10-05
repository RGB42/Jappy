import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' erlaubt das Hosten in einem Unterordner (z. B. GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  // Alle Lerninhalte sind bewusst im Bundle (offline nutzbar) – daher größer als üblich.
  build: { chunkSizeWarningLimit: 1200 },
  // Spracherkennungs-Worker (transformers.js) als ES-Modul bauen.
  worker: { format: 'es' },
  test: {
    environment: 'node',
  },
});
