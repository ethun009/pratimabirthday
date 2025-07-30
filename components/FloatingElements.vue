<template>
  <div class="floating-elements-container">
    <div 
      v-for="element in elements" 
      :key="element.id" 
      class="floating-element"
      :class="element.type"
      :style="getElementStyle(element)"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const elements = ref([]);
const totalElements = 30; // Total number of floating elements
let animationFrameId = null;

// Create floating elements with random properties
const createElements = () => {
  for (let i = 0; i < totalElements; i++) {
    const type = Math.random() > 0.7 ? 'sparkle' : 'heart';
    const size = type === 'heart' ? 
      10 + Math.random() * 20 : // Hearts: 10-30px
      5 + Math.random() * 10;   // Sparkles: 5-15px
    
    elements.value.push({
      id: i,
      type,
      x: Math.random() * 100, // Random horizontal position (0-100%)
      y: 100 + Math.random() * 50, // Start below screen (100-150%)
      size,
      speed: 0.3 + Math.random() * 0.7, // Random speed (0.3-1.0)
      opacity: 0.3 + Math.random() * 0.7, // Random opacity (0.3-1.0)
      rotation: Math.random() * 360, // Random initial rotation
      rotationSpeed: -1 + Math.random() * 2, // Random rotation speed (-1 to 1 deg/frame)
      delay: Math.random() * 15 // Random delay for staggered start (0-15s)
    });
  }
};

// Animate elements moving upward
const animateElements = () => {
  elements.value.forEach(element => {
    // Only start animation after delay
    if (element.delay > 0) {
      element.delay -= 0.016; // Approximately 16ms per frame (60fps)
      return;
    }
    
    // Move element upward
    element.y -= element.speed;
    
    // Rotate element
    element.rotation += element.rotationSpeed;
    
    // Reset position when it goes off-screen
    if (element.y < -10) {
      element.y = 100 + Math.random() * 20;
      element.x = Math.random() * 100;
    }
  });
  
  animationFrameId = requestAnimationFrame(animateElements);
};

// Generate style object for each element
const getElementStyle = (element) => {
  if (element.delay > 0) {
    return { opacity: 0 };
  }
  
  return {
    left: `${element.x}%`,
    bottom: `${element.y}%`,
    width: `${element.size}px`,
    height: `${element.size}px`,
    opacity: element.opacity,
    transform: `rotate(${element.rotation}deg)`,
    filter: `blur(${element.type === 'sparkle' ? 0.5 : 0}px) brightness(${1 + element.opacity})`
  };
};

onMounted(() => {
  createElements();
  animateElements();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.floating-elements-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
}

.floating-element {
  position: absolute;
  transform-origin: center center;
  transition: opacity 0.3s ease;
}

.heart {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff6b95'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E");
  filter: drop-shadow(0 0 5px rgba(255, 107, 149, 0.7));
}

.sparkle {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffeb3b'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E");
  filter: drop-shadow(0 0 5px rgba(255, 235, 59, 0.7));
}
</style> 