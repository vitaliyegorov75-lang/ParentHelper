const CACHE_NAME = 'parent-helper-v1.1';
const urlsToCache = [
  '/ParentHelper/',
  '/ParentHelper/index.html',
  '/ParentHelper/styles.css',
  '/ParentHelper/manifest.json',
  '/ParentHelper/icons/icon-192x192.png',
  '/ParentHelper/icons/icon-512x512.png',
  '/ParentHelper/images/MotherBaby.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Возвращаем кэш или делаем запрос
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Очистка старого кэша
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});