
const CACHE_NAME = 'syllabus-v1.3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json'
];

// Patterns for heavy external assets
const ASYNC_ASSETS_PATTERN = /fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com\/leaflet|basemaps\.cartocdn\.com/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Stale-While-Revalidate Strategy for specific patterns
  if (ASYNC_ASSETS_PATTERN.test(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Default: Network First with Cache Fallback for primary app logic
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
