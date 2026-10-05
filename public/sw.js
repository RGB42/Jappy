// Service Worker: macht Jappy offline nutzbar.
// Seiten: erst Netz, dann Cache. Dateien (JS/CSS/Bilder): erst Cache, dann Netz.
const CACHE = 'jappy-v2';
const KEEP = [CACHE, 'jappy-audio'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Seiten und der Audio-Index: erst Netz (damit Updates ankommen), offline aus dem Cache.
  if (req.mode === 'navigate' || new URL(req.url).pathname.endsWith('/audio/index.json')) {
    const key = req.mode === 'navigate' ? './index.html' : req;
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key, copy));
          return res;
        })
        .catch(() => caches.match(key)),
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.status === 200) {
            const copy = res.clone();
            const target = new URL(req.url).pathname.includes('/audio/') ? 'jappy-audio' : CACHE;
            caches.open(target).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        }),
    ),
  );
});
