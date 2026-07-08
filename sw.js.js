const CACHE_NAME = 'offline-ar-video-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './background.mp4'
];

// High-performance MediaPipe CDN assets to pull down and lock in local device storage
const MEDIAPIPE_CDN = [
  'https://jsdelivr.net',
  'https://jsdelivr.net',
  'https://cloudflare.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...ASSETS, ...MEDIAPIPE_CDN]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Automatically intercept and pull any incoming MediaPipe engine calls directly from your offline cache sandbox
  if (event.request.url.includes('@mediapipe') || event.request.url.includes('selfie_segmentation')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Standard Cache-First fetch loop processing for your core website architecture assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
