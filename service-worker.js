// service-worker.js - Минимальная рабочая версия
const CACHE_NAME = 'parent-helper-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('offline-v1').then(cache => {
      return cache.addAll(['/offline.html']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      // Сначала пробуем найти в кэше основной запрос
      const cached = await caches.match(event.request);
      if (cached) return cached;
      
      // Если не нашли, показываем оффлайн-страницу
      const offlineCache = await caches.open('offline-v1');
      const offlinePage = await offlineCache.match('/offline.html');
      return offlinePage || new Response('Оффлайн режим');
    })
  );
});