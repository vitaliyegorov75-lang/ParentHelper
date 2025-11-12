const CACHE_NAME = 'parent-helper-v3.0';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Установка Service Worker
self.addEventListener('install', function(event) {
  console.log('🔄 Service Worker: Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Service Worker: Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('❌ Service Worker: Ошибка кэширования', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
  console.log('🎉 Service Worker: Активация');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Удаление старого кэша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Возвращаем кэш или делаем запрос
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(response) {
          // Не кэшируем неподходящие ответы
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонируем ответ
          var responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});