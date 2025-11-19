// service-worker.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ ДЛЯ GITHUB PAGES
const CACHE_NAME = 'parent-helper-v4';
const OFFLINE_URL = './offline.html';

// Файлы для кэширования при установке
const PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './script.js',
  './manifest.json',
  // Основные страницы приложения
  './calculator.html',
  './diary.html', 
  './tracker.html',
  './notes.html',
  './care.html',
  './nutrition.html',
  './health.html',
  './psychology.html',
  './contact.html',
  // Иконки
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png'
];

// Установка - кэшируем все необходимое
self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker: Установка начата');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Кэшируем основные ресурсы');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Установка завершена');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Ошибка установки', error);
      })
  );
});

// Активация - очищаем старые кэши
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Активация');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Удаляем старый кэш', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Активация завершена');
      return self.clients.claim();
    })
  );
});

// Обработка всех запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Кэшируем успешные ответы
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // При ошибке сети - ищем в кэше
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если навигационный запрос - показываем оффлайн страницу
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // Для других ресурсов возвращаем пустой ответ
            return new Response('Оффлайн', { 
              status: 408, 
              statusText: 'Offline' 
            });
          });
      })
  );
});

// Фоновая синхронизация (для будущих функций)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
});