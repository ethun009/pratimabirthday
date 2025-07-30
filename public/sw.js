// Service Worker for Pratima Birthday Website

const CACHE_NAME = 'pratima-birthday-cache-v2';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',  // Add this line
  
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
  '/assets/voice/when a heart knows.wav',
  
  // 16:9 Videos
  '/assets/16-9/videos/boy_sending_love.mp4',
  '/assets/16-9/videos/boy_standing1.mp4',
  '/assets/16-9/videos/girl_asking.mp4',
  '/assets/16-9/videos/girl_catching_love.mp4',
  '/assets/16-9/videos/girl_grabing_love.mp4',
  '/assets/16-9/videos/map_anim.mp4',
  '/assets/16-9/videos/map_anim_upscale.mp4',
  
  // 9:16 Videos
  '/assets/9-16/videos/boy_sending_love.mp4',
  '/assets/9-16/videos/boy_standing.mp4',
  '/assets/9-16/videos/girl_asking.mp4',
  '/assets/9-16/videos/girl_catching_love.mp4',
  '/assets/9-16/videos/girl_grabing_love.mp4',
  '/assets/9-16/videos/map_anim.mp4',
  '/assets/9-16/videos/map_anim_upscale.mp4',
  
  // 16:9 Normal Images
  '/assets/16-9/normal_images/boy_sending_love.jpg',
  '/assets/16-9/normal_images/boy_standing.jpg',
  '/assets/16-9/normal_images/girl_catching_love.jpg',
  '/assets/16-9/normal_images/girl_grabing_love.jpg',
  
  // 9:16 Normal Images
  '/assets/9-16/normal_images/boy_sending_love.jpg',
  '/assets/9-16/normal_images/boy_standing.jpg',
  '/assets/9-16/normal_images/girl_catching_love.jpg',
  '/assets/9-16/normal_images/girl_grabing_love.jpg',
  
  // 16:9 Upscaled Images
  '/assets/16-9/upscaled_images/boy_sending_love.png',
  '/assets/16-9/upscaled_images/boy_standing.png',
  '/assets/16-9/upscaled_images/girl_catching_love.png',
  '/assets/16-9/upscaled_images/girl_grabing_love.png',
  
  // 9:16 Upscaled Images
  '/assets/9-16/upscaled_images/boy_sending_love.png',
  '/assets/9-16/upscaled_images/boy_standing.png',
  '/assets/9-16/upscaled_images/girl_catching_love.png',
  '/assets/9-16/upscaled_images/girl_grabing_love.png'
];

// Install event - precache all essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching assets');
        return cache.addAll(PRECACHE_ASSETS);
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

// Fetch event - serve from cache or network
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
          return caches.match(event.request);
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
        return fetch(event.request).then(response => {
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
        });
      })
    );
    return;
  }
  
  // For all other requests - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Update the cache
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(error => {
        console.error('Fetch failed:', error);
        // Return offline fallback for JS and CSS if needed
      });
      
      // Return the cached response immediately, or wait for network response
      return cachedResponse || fetchPromise;
    })
  );
});