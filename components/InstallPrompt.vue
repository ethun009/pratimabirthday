<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="install-content">
      <h3>Install this app</h3>
      <p>Install this app on your device for a better experience</p>
      <div class="install-buttons">
        <button @click="installApp" class="install-btn">Install</button>
        <button @click="dismissPrompt" class="dismiss-btn">Not now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const showInstallPrompt = ref(false);
let deferredPrompt = null;

// Check if the app can be installed
onMounted(() => {
  if (process.client) {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Save the event for later use
      deferredPrompt = e;
      // Show our custom install prompt
      showInstallPrompt.value = true;
    });

    // Hide the prompt if the app is installed
    window.addEventListener('appinstalled', () => {
      showInstallPrompt.value = false;
      deferredPrompt = null;
      console.log('App was installed');
    });
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('beforeinstallprompt', () => {});
    window.removeEventListener('appinstalled', () => {});
  }
});

// Function to trigger the install prompt
const installApp = () => {
  if (!deferredPrompt) return;
  
  // Show the browser install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // Clear the saved prompt
    deferredPrompt = null;
    // Hide our custom prompt
    showInstallPrompt.value = false;
  });
};

// Function to dismiss the prompt
const dismissPrompt = () => {
  showInstallPrompt.value = false;
  // Save to localStorage to avoid showing again in this session
  if (process.client) {
    localStorage.setItem('installPromptDismissed', 'true');
  }
};
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.install-content {
  text-align: center;
}

.install-content h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.install-content p {
  margin: 0 0 15px 0;
  color: #666;
}

.install-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.install-btn {
  background-color: #ff69b4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.install-btn:hover {
  background-color: #ff5ba7;
}

.dismiss-btn {
  background-color: transparent;
  color: #666;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dismiss-btn:hover {
  background-color: #f5f5f5;
}
</style>