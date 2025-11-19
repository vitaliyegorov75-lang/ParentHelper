// service-worker.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
const CACHE_NAME = 'parent-helper-v3';
const OFFLINE_URL = '/offline.html';

// Файлы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/styles.css',
  '/manifest.json',
  // Добавь сюда основные HTML страницы приложения
  '/calculator.html',
  '/diary.html', 
  '/tracker.html',
  '/notes.html'
];

// Установка - кэшируем все необходимое
self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация - очищаем старые кэши
self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия: Сеть сначала, потом кэш, потом оффлайн-страница
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;

  // Для навигационных запросов - особая логика
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Обновляем кэш при успешном ответе
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // При ошибке сети ищем в кэше
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Если нет в кэше - показываем оффлайн-страницу
              return caches.match(OFFLINE_URL);
            });
        })
    );
  } else {
    // Для остальных ресурсов (CSS, JS, иконки)
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              // Кэшируем новые ресурсы
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            })
            .catch(() => {
              // Для CSS/JS возвращаем пустой ответ вместо оффлайн-страницы
              if (event.request.destination === 'style' || 
                  event.request.destination === 'script') {
                return new Response('', { 
                  status: 408, 
                  statusText: 'Offline' 
                });
              }
              return caches.match(OFFLINE_URL);
            });
        })
    );
  }
});