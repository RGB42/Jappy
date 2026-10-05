import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadAudioIndex, unlockAudio } from './lib/audioBank';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Eingebaute Aufnahmen vorbereiten; Audio beim ersten Tippen freischalten (iOS/Safari/Firefox).
void loadAudioIndex();
window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

// Offline-Unterstützung (nur im Produktions-Build)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
