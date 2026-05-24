const CACHE_VERSION = '2';
const CACHE_NAME = `ecoscan-dlh-v${CACHE_VERSION}`;
const STATIC_ASSETS = 'ecoscan-static-v' + CACHE_VERSION;
const MAX_STATIC_ENTRIES = 60; // Keep cache size bounded

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Helper: Trim cache to max number of entries
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const deleteCount = keys.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      caches.open(STATIC_ASSETS)
    ]).then(() => {
      self.skipWaiting();
    }).catch(() => {
      // Silently fail install caching if something goes wrong
    })
  );
});

// Activate Service Worker - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (!cacheName.includes('v' + CACHE_VERSION)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event - Handle update checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event - Smart caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Handle API calls - Network First
  if (url.hostname.includes('localhost')) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          return new Response(JSON.stringify({
            success: false,
            message: 'Offline - Server tidak tersedia'
          }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          });
        })
    );
    return;
  }

  // Handle HTML pages - Network First (untuk update langsung)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return caches.match(request);
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
            trimCache(CACHE_NAME, 20);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Handle static assets - Cache First, then Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(STATIC_ASSETS).then((cache) => {
                  cache.put(request, response.clone());
                  trimCache(STATIC_ASSETS, MAX_STATIC_ENTRIES);
                });
              }
            })
            .catch(() => { });
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_ASSETS).then((cache) => {
            cache.put(request, responseToCache);
            trimCache(STATIC_ASSETS, MAX_STATIC_ENTRIES);
          });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback page
        return new Response('<h1>Offline</h1><p>Aplikasi sedang offline</p>', {
          status: 503,
          headers: new Headers({
            'Content-Type': 'text/html; charset=utf-8'
          })
        });
      })
  );
});

// Background Sync (untuk retry ketika online kembali)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') { // Sync failed scans when back online
    event.waitUntil(
      fetch(`${location.protocol}//${location.hostname}:${location.port || 3030}/api/scan/save`)
        .catch(() => {
          // Silent fail, will retry later
        })
    );
  }
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.message || 'Notifikasi dari EcoScan DLH',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'ecoscan-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'EcoScan DLH', options)
  );
});
