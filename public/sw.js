// Service Worker for Pratima Birthday Website

const CACHE_NAME = 'pratima-birthday-cache-v3';

// List of all routes to cache for offline access
const ROUTES = [
  '/',
  '/index.html',
  '/main',
  '/second',
  '/third',
  '/fourth',
  '/final',
  '/gift',
  '/memories'
];

// Install event - cache all routes and essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and content');
        // Cache all routes first
        return cache.addAll(ROUTES)
          .then(() => {
            // Continue with installation even if some assets fail to cache
            console.log('Routes cached successfully');
            return self.skipWaiting();
          })
          .catch(error => {
            console.error('Pre-caching routes failed:', error);
            // Continue with installation even if some assets fail to cache
            return self.skipWaiting();
          });
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('pratima-birthday-') && 
                   cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Claim clients so the service worker is in control without reload
        return self.clients.claim();
      })
  );
});

// Helper function to determine if a request is for an asset
function isAssetRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'image' || 
         request.destination === 'audio' || 
         request.destination === 'video' || 
         request.destination === 'style' ||
         request.destination === 'script' ||
         url.pathname.includes('/assets/');
}

// Helper function to determine if a request is for a route/page
function isRouteRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
}

// Fetch event - comprehensive caching strategy
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Strategy for HTML/route requests: Cache, falling back to network, then cache the network response
  if (isRouteRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // Fetch from network in the background to update cache
            fetch(request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  const clonedResponse = networkResponse.clone();
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, clonedResponse);
                  });
                }
              })
              .catch(() => console.log('Offline page served from cache'));
              
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(request)
            .then(networkResponse => {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }
              
              // Cache the network response
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
              
              return networkResponse;
            })
            .catch(() => {
              // If both cache and network fail, return the offline page
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // Strategy for assets: Cache first, network as fallback, always cache new assets
  if (isAssetRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Otherwise fetch from network and cache
          return fetch(request)
            .then(networkResponse => {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }
              
              // Cache the fetched resource
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
                console.log('Asset cached on first access:', request.url);
              });
              
              return networkResponse;
            })
            .catch(error => {
              console.error('Fetch failed for asset:', error);
              // No fallback for assets
            });
        })
    );
    return;
  }
  
  // Default strategy for everything else: Cache first, network as fallback, always update cache
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Fetch from network in the background to update cache
          fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => console.log('Using cached version of:', request.url));
            
          return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache the response
        return fetch(request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Cache the network response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // No default fallback
          });
      })
  );
});