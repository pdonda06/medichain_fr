// MediCare Service Worker

const CACHE_NAME = 'medicare-cache-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo192.png',
  './logo512.png',
  './favicon.ico',
  './offline.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('ngrok')) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip requests to API endpoints
  if (event.request.url.includes('/api/')) {
    return fetch(event.request);
  }

  // For navigation requests, use a network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./offline.html');
        })
    );
    return;
  }

  // For assets, use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return the response from the cached version
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - return the result from the live server
        // Clone the request because it's a one-time use stream
        return fetch(event.request.clone())
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as it's a stream that can only be consumed once
            const responseToCache = response.clone();

            // Cache the fetched response for next time
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            // Return the response
            return response;
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed:', error);
            
            // For image requests, return a default image
            if (event.request.destination === 'image') {
              return caches.match('./logo192.png');
            }
            
            // For other requests, just return a basic error
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: './logo192.png',
    badge: './favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
}); 