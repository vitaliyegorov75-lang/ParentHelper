// service-worker.js - РодительскийПомощник
// Версия: 3.0 - Dynamic Caching Strategy

const CACHE_NAME = 'parent-helper-v3.0-' + new Date().getTime();
const STATIC_CACHE = 'parent-helper-static-v3.0';
const DYNAMIC_CACHE = 'parent-helper-dynamic-v3.0';

// Файлы для предварительного кэширования (ядро приложения)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/calculator.html',
  '/tracker.html', 
  '/diary.html',
  '/notes.html',
  '/care.html',
  '/nutrition.html',
  '/health.html',
  '/routine.html',
  '/psychology.html',
  '/support.html',
  '/methods.html',
  '/faq.html',
  '/contact.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Файлы, которые НЕ нужно кэшировать
const NO_CACHE_FILES = [
  '/service-worker.js',
  '/update.html'
];

// === УСТАНОВКА ===
self.addEventListener('install', event => {
  console.log('🔄 Service Worker: Установка v3.0');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Кэшируем статические файлы');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Статические файлы закэшированы');
        return self.skipWaiting(); // Активируем сразу
      })
      .catch(error => {
        console.error('❌ Ошибка кэширования:', error);
      })
  );
});

// === АКТИВАЦИЯ ===
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Активация v3.0');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Удаляем старые кэши
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker активирован');
      return self.clients.claim(); // Берем управление всеми вкладками
    })
  );
});

// === ОБРАБОТКА ЗАПРОСОВ ===
self.addEventListener('fetch', event => {
  // Пропускаем не-GET запросы и определенные файлы
  if (event.request.method !== 'GET' || 
      NO_CACHE_FILES.some(pattern => event.request.url.includes(pattern))) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Всегда делаем сетевой запрос для обновления
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Клонируем ответ для кэша
            const responseClone = networkResponse.clone();
            
            // Кэшируем только успешные ответы
            if (networkResponse.status === 200) {
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
            }
            
            return networkResponse;
          })
          .catch(error => {
            console.log('🌐 Нет сети, используем кэш:', error);
          });

        // Возвращаем из кэша немедленно, но обновляем кэш
        return cachedResponse || fetchPromise;
      })
  );
});

// === ФОНОВАЯ СИНХРОНИЗАЦИЯ ===
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Фоновая синхронизация');
    event.waitUntil(doBackgroundSync());
  }
});

// === PUSH УВЕДОМЛЕНИЯ ===
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Новое уведомление от РодительскийПомощник',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'РодительскийПомощник', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

// Фоновая синхронизация данных
async function doBackgroundSync() {
  try {
    // Здесь может быть синхронизация с сервером
    console.log('✅ Фоновая синхронизация завершена');
  } catch (error) {
    console.error('❌ Ошибка фоновой синхронизации:', error);
  }
}

// Очистка устаревших данных
async function cleanupOldData() {
  try {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Очистка старых данных из localStorage (через сообщения)
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CLEANUP_OLD_DATA',
        data: { timestamp: weekAgo }
      });
    });
  } catch (error) {
    console.error('❌ Ошибка очистки данных:', error);
  }
}

// === ОБРАБОТКА СООБЩЕНИЙ ===
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => caches.delete(cacheName));
      });
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: '3.0' });
      break;
      
    default:
      console.log('📨 Получено сообщение:', type);
  }
});

// === ПЕРИОДИЧЕСКИЕ ЗАДАЧИ ===
// Запускаем очистку раз в день
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

console.log('🎯 Service Worker РодительскийПомощник загружен v3.0');