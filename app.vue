<template>
  <div>
    <NuxtPage />
    <InstallPrompt />
  </div>
</template>

<script setup>
// Add meta tags for PWA support
useHead({
  link: [
    { rel: 'manifest', href: '/manifest.json' }
  ],
  meta: [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Pratima Birthday' },
    { name: 'theme-color', content: '#ffffff' }
  ]
})

import { onMounted } from 'vue'

// Access the background music plugin
const { $bgMusic } = useNuxtApp()

// Initialize music on client-side only
onMounted(() => {
  // Music will be automatically handled by the plugin
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');


html, body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
}
</style>
