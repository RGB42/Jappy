// Schutz vor versehentlichem „Ziehen zum Aktualisieren“ auf dem Handy: Steht die Seite ganz oben und bewegt sich
// der Finger nach unten, gibt es nichts zu scrollen – diese Geste wird abgefangen, statt die Seite neu zu laden
// (und die laufende Übung zu verlieren). Ergänzt `overscroll-behavior-y: none` für Browser, die das ignorieren.

/** Soll eine Fingerbewegung blockiert werden? (exportiert für Tests) */
export function shouldBlock(dx: number, dy: number, pageScrollTop: number, target: Element | null): boolean {
  if (dy <= 0 || Math.abs(dx) > dy) return false; // nur Bewegungen nach unten
  if (pageScrollTop > 0) return false; // Seite ist gescrollt → normal zurückscrollen
  // Ein inneres Element (Textfeld, Liste), das selbst nach oben scrollen kann, darf das weiterhin.
  for (let el = target; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.scrollTop > 0) return false;
  }
  return true;
}

export function preventPullToRefresh() {
  if (typeof window === 'undefined' || !('ontouchstart' in window)) return;
  let x = 0;
  let y = 0;
  window.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length !== 1 || !e.cancelable) return;
      const t = e.touches[0];
      const top = document.scrollingElement?.scrollTop ?? window.scrollY;
      if (shouldBlock(t.clientX - x, t.clientY - y, top, e.target as Element | null)) e.preventDefault();
    },
    { passive: false },
  );
}
