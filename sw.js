/* sw.js — app-shell cache so the ledger opens even with zero signal */
const CACHE = 'av-shell-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/layout.css',
  './css/components.css',
  './js/db.js',
  './js/i18n.js',
  './js/utils.js',
  './js/theme.js',
  './js/tour.js',
  './js/backup.js',
  './js/home.js',
  './js/customers.js',
  './js/forms.js',
  './js/detail.js',
  './js/app.js',
  './icons/logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/upi-qr.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request)) // only offline falls back to the cached copy
  );
});
