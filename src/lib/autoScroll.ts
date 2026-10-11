// Elemente mit `data-autoscroll` (z. B. „Weiter“ nach einer Antwort) beim Erscheinen sanft ins Bild holen –
// auf kleinen Bildschirmen lägen sie sonst unterhalb des sichtbaren Bereichs.
export function startAutoScroll() {
  if (typeof MutationObserver === 'undefined') return;
  const reveal = (el: Element) =>
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight - 8 || r.top < 0) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  new MutationObserver((records) => {
    for (const rec of records)
      for (const node of rec.addedNodes) {
        if (!(node instanceof Element)) continue;
        const el = node.matches('[data-autoscroll]') ? node : node.querySelector('[data-autoscroll]');
        if (el) reveal(el);
      }
  }).observe(document.body, { childList: true, subtree: true });
}
