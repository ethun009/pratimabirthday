<template>
  <div class="typewriter-container">
    <p class="typewriter-text">{{ displayText }}<span class="cursor" :class="{ 'blink': isBlinking }">|</span></p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  phrases: {
    type: Array,
    required: true,
    default: () => []
  },
  typingSpeed: {
    type: Number,
    default: 100
  },
  deletingSpeed: {
    type: Number,
    default: 50
  },
  pauseDuration: {
    type: Number,
    default: 2000
  }
});

const displayText = ref('');
const currentPhraseIndex = ref(0);
const isTyping = ref(true);
const isDeleting = ref(false);
const isPaused = ref(false);
const isBlinking = ref(true);

let typingInterval = null;

const typeText = () => {
  const currentPhrase = props.phrases[currentPhraseIndex.value];
  
  if (!currentPhrase) return;
  
  // If typing
  if (isTyping.value && !isDeleting.value) {
    if (displayText.value.length < currentPhrase.length) {
      displayText.value = currentPhrase.substring(0, displayText.value.length + 1);
    } else {
      // Done typing, pause before deleting
      isTyping.value = false;
      isPaused.value = true;
      
      setTimeout(() => {
        isPaused.value = false;
        isDeleting.value = true;
      }, props.pauseDuration);
    }
  }
  
  // If deleting
  else if (isDeleting.value) {
    if (displayText.value.length > 0) {
      displayText.value = displayText.value.substring(0, displayText.value.length - 1);
    } else {
      // Done deleting, move to next phrase
      isDeleting.value = false;
      currentPhraseIndex.value = (currentPhraseIndex.value + 1) % props.phrases.length;
      isTyping.value = true;
    }
  }
};

const startTypewriter = () => {
  clearInterval(typingInterval);
  typingInterval = setInterval(() => {
    if (isPaused.value) return;
    
    typeText();
    
    // Control cursor blinking
    if (isPaused.value) {
      isBlinking.value = true;
    } else {
      isBlinking.value = false;
    }
  }, isDeleting.value ? props.deletingSpeed : props.typingSpeed);
};

// Watch for changes in phrases
watch(() => props.phrases, () => {
  displayText.value = '';
  currentPhraseIndex.value = 0;
  isTyping.value = true;
  isDeleting.value = false;
  isPaused.value = false;
  startTypewriter();
}, { deep: true });

onMounted(() => {
  startTypewriter();
  
  // Blink cursor every 500ms
  setInterval(() => {
    if (isPaused.value) {
      isBlinking.value = !isBlinking.value;
    }
  }, 500);
});

onBeforeUnmount(() => {
  if (typingInterval) {
    clearInterval(typingInterval);
  }
});
</script>

<style scoped>
.typewriter-container {
  display: inline-block;
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  padding: 15px 25px;
  box-shadow: 0 8px 32px rgba(156, 107, 148, 0.2);
}

.typewriter-text {
  font-size: 1.5rem;
  color: #9c6b94;
  margin: 0;
  white-space: pre-wrap;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.cursor {
  display: inline-block;
  color: #ff6b95;
  font-weight: bold;
  margin-left: 2px;
}

.cursor.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .typewriter-text {
    font-size: 1.2rem;
  }
  
  .typewriter-container {
    padding: 10px 15px;
  }
}
</style> 