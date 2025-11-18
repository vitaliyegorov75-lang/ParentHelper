const CACHE_NAME = 'parent-helper-v2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/calculator.html',
  '/diary.html',
  '/tracker.html',
  '/notes.html',
  '/care.html',
  '/nutrition.html', 
  '/health.html',
  '/psychology.html',
  '/contact.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});