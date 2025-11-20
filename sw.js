const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline.html'; // Путь к вашей заглушке


// Событие установки: кэшируем офлайн‑страницу
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
  );
});

// Событие активации: очищаем старые кэши (опционально)
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

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Только для навигационных запросов (HTML‑страницы)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }

  // Для остальных запросов (изображения, CSS, JS) — стандартный кэш
  if (!event.request.url.startsWith(self.location.origin)) {
    return; // Не перехватываем внешние ресурсы
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});