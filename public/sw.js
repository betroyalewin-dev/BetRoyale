// BetRoyale Service Worker
// Cache-first for static assets · Network-first for API calls

const CACHE_VERSION = 'v3';
const CACHE_NAME = `betroyale-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/favicon.svg',
  '/brand/betroyale-icon-192.png',
  '/brand/betroyale-icon-512.png',
];

// ── Install: pre-cache all static assets ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Take over immediately without waiting for old SW to expire
  self.skipWaiting();
});

// ── Activate: remove stale caches from old versions ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('betroyale-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Claim all open clients so the new SW takes effect without a reload
  self.clients.claim();
});

// ── Fetch: routing strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our own origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // API calls: network-only (never serve stale auth/game data from cache)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // HTML shell/navigation: network-first so menu and layout changes appear promptly.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          }
          return response;
        })
        .catch(() => caches.match('/') || Response.error())
    );
    return;
  }

  // Static assets: cache-first, fall back to network and cache the response
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Only cache valid responses
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: if it's a navigation request, serve the cached shell
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
