// ============================================================
// sw.js — Service Worker — Reserva Fácil PWA
// ============================================================

const CACHE_NAME = 'reservafacil-v1';

const STATIC_ASSETS = [
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json'
];

// ── Instalação: pré-cacheamento dos assets estáticos ─────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Ativação: remove caches antigos ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first para estáticos, network-first para API ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requisições à API do Apps Script → sempre rede
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos → cache-first com fallback para rede
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cacheia apenas respostas bem-sucedidas de mesma origem
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
