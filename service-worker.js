// CSCP v2 service worker — cache-first for the shell.
// Bumped to invalidate after Hisham repeat-bug fix + flashcard/MCQ separation.
const CACHE_VERSION = 'cscp-v20260630-0611-hishamfix';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(r).then(cached => {
      const fp = fetch(r).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const cc = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(r, cc));
        }
        return resp;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || fp;
    })
  );
});
