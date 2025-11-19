// service-worker.js - АВАРИЙНЫЙ РЕЖИМ АКТИВАЦИИ
const CACHE_NAME = 'parent-helper-emergency';
const OFFLINE_URL = './offline.html';

// КРИТИЧЕСКИЕ ФАЙЛЫ - только самое необходимое
const CRITICAL_URLS = [
  './',
  './index.html', 
  './offline.html',
  './styles.css',
  './manifest.json'
];

// СИЛА АКТИВАЦИИ - немедленная
self.addEventListener('install', (event) => {
  console.log('⚡ EMERGENCY INSTALL - принудительная активация');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CRITICAL_URLS))
      .then(() => {
        console.log('✅ Критические файлы закэшированы');
        return self.skipWaiting(); // НЕМЕДЛЕННАЯ АКТИВАЦИЯ
      })
      .catch(error => {
        console.error('❌ Ошибка кэширования:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('⚡ EMERGENCY ACTIVATE - захват контроля');
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // НЕМЕДЛЕННЫЙ КОНТРОЛЬ
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Удаляем старый кэш:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// ПРОСТАЯ И НАДЕЖНАЯ СТРАТЕГИЯ
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Пытаемся сеть, но если ошибка - кэш
        return fetch(event.request)
          .then(networkResponse => {
            // Кэшируем успешные ответы
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Если в кэше есть - отдаем
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если навигация - оффлайн страница
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // Пустой ответ для остального
            return new Response('Оффлайн', { status: 408 });
          });
      })
  );
});

// Принудительная активация при сообщении
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});