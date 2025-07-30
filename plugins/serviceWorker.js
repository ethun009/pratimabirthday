export default defineNuxtPlugin((nuxtApp) => {
  // Only register service worker in production and on client-side
  if (process.client && process.env.NODE_ENV === 'production') {
    // Wait for the app to be mounted
    nuxtApp.hook('app:mounted', () => {
      // Check if service workers are supported
      if ('serviceWorker' in navigator) {
        // Register the service worker
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    });
  }
});