// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'To You, From Miles Away...',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A special message from miles away' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  experimental: {
    payloadExtraction: false
  },
  nitro: {
    prerender: {
      crawlLinks: true
    }
  },
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },
  hooks: {
    'build:before': () => {
      if (process.env.NODE_ENV === 'production') {
        console.log('Preparing production build with obfuscation...')
      }
    }
  },
  // Add this to your existing plugins array
  plugins: [
    // Remove this line: { src: '~/obfuscator.js', mode: 'client' },
    { src: '~/plugins/serviceWorker.js', mode: 'client' }
  ],
})
