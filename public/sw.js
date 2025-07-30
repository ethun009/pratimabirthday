// Service Worker for Pratima Birthday Website

const CACHE_NAME = 'pratima-birthday-cache-v3'; // Increment cache version

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  
  // Static images
  '/assets/balloons.png',
  '/assets/cake.png',
  '/assets/dove.gif',
  '/assets/heartballoon.png',
  '/assets/letter-envelope.png',
  '/assets/table.png',
  
  // Girl folder images
  '/assets/girl/pic1.png',
  '/assets/girl/pic2.png',
  '/assets/girl/pic3.png',
  '/assets/girl/pic4.png',
  '/assets/girl/pic5.png',
  
  // Songs
  '/assets/songs/Bhalobashi Bole Dao.mp3',
  '/assets/songs/Timro Pratiksa.mp3',
  '/assets/songs/Tum Jo Aaye.mp3',
  
  // Voice files
  '/assets/voice/And in that moment.wav',
  '/assets/voice/And now that you hold it.wav',
  '/assets/voice/Did you feel it.wav',
  '/assets/voice/Distance means nothing .wav',
  '/assets/voice/From Bangladesh, with all my love.wav',
  '/assets/voice/I knew you also love me.wav',
  '/assets/voice/Somewhere far away, under the same sky… I think of you.wav',
  '/assets/voice/That\'s me… arriving in your heart.wav',
  '/assets/voice/With every beat of my heart.wav',
  '/assets/voice/bg song.wav',
  '/assets/voice/bg song1.wav',
  '/assets/voice/letter.wav',
  '/assets/voice/when a heart knows.wav'
  
  // Removed video and image assets from precache to handle them on-demand
];

// Install event - precache essential assets with error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching essential assets');
        // Use addAll for critical assets
        return cache.addAll(PRECACHE_ASSETS).catch(error => {
          console.error('Pre-caching failed:', error);
          // Continue with installation even if some assets fail to cache
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network with improved strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // For HTML pages - network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the page for offline use
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }
  
  // For assets (images, audio, video) - cache first, then network
  if (event.request.destination === 'image' || 
      event.request.destination === 'audio' || 
      event.request.destination === 'video' ||
      event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network and cache
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache the fetched resource
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(error => {
            console.error('Fetch failed for asset:', error);
            // Return a fallback image or response if available
            return new Response('Asset not available offline');
          });
      })
    );
    return;
  }
  
  // For all other requests - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Update the cache
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(error => {
          console.error('Fetch failed:', error);
          // No fallback needed here as we return cachedResponse below if available
        });
      
      // Return the cached response immediately, or wait for network response
      return cachedResponse || fetchPromise;
    })
  );
});