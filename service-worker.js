const CACHE_NAME = 'parent-helper-v1.2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './images/MotherBaby.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(function(error) {
          console.log('Cache addAll error:', error);
        });
      })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Возвращаем кэш или делаем запрос
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(response) {
          // Кэшируем только успешные ответы
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        });
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