/* Onward service worker — works offline for everything except live searches. */
const VERSION = 'onward-v2';
const SHELL = ['./', 'index.html', 'app.js', 'data.js', 'manifest.json', 'zip3index.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'install.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // live searches go straight to the network
  // Network first (so updates show up), fall back to cache when offline
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
