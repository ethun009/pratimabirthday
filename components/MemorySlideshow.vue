<template>
  <div class="slideshow-container">
    <div class="slideshow-frame"></div>
    <transition-group name="fade" tag="div" class="slides-wrapper">
      <div 
        v-for="(slide, index) in slides" 
        :key="slide.id" 
        class="slide" 
        :class="{ active: currentSlideIndex === index }"
      >
        <div class="image-container" :style="getKenBurnsStyle(index)">
          <img :src="slide.image" :alt="slide.caption" />
        </div>
        <div class="caption-container">
          <div class="caption" :class="{ 'caption-visible': currentSlideIndex === index }">
            {{ slide.caption }}
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

// Updated slides data with the new images
const slides = ref([
  { 
    id: 1, 
    image: '/assets/girl/pic1.png', 
    caption: 'The day we first met, my world changed forever...'
  },
  { 
    id: 2, 
    image: '/assets/girl/pic2.png', 
    caption: 'Every moment apart, I send my love across the miles...'
  },
  { 
    id: 3, 
    image: '/assets/girl/pic3.png', 
    caption: 'Your smile is the light that guides me home...'
  },
  { 
    id: 4, 
    image: '/assets/girl/pic4.png', 
    caption: 'In your eyes, I found my forever...'
  },
  { 
    id: 5, 
    image: '/assets/girl/pic5.png', 
    caption: 'With you, every day feels like a beautiful dream...'
  }
]);

const currentSlideIndex = ref(0);
let slideshowInterval = null;
let kenBurnsDirections = [];

// Initialize random Ken Burns effect directions for each slide
const initKenBurnsDirections = () => {
  slides.value.forEach(() => {
    // Random scale between 1.1 and 1.3
    const scale = 1.1 + Math.random() * 0.2;
    // Random position shifts
    const translateX = -5 + Math.random() * 10; // -5% to 5%
    const translateY = -5 + Math.random() * 10; // -5% to 5%
    
    kenBurnsDirections.push({
      scale,
      translateX,
      translateY
    });
  });
};

const getKenBurnsStyle = (index) => {
  if (!kenBurnsDirections[index]) return {};
  
  const isActive = currentSlideIndex.value === index;
  const { scale, translateX, translateY } = kenBurnsDirections[index];
  
  return {
    transform: isActive 
      ? `scale(${scale}) translate(${translateX}%, ${translateY}%)` 
      : 'scale(1) translate(0%, 0%)',
    transition: 'transform 10s ease-in-out'
  };
};

const nextSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length;
};

onMounted(() => {
  initKenBurnsDirections();
  slideshowInterval = setInterval(nextSlide, 7000);
});

onBeforeUnmount(() => {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
  }
});
</script>

<style scoped>
.slideshow-container {
  position: relative;
  width: 100%;
  height: 550px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 
    0 15px 35px rgba(156, 107, 148, 0.4),
    0 5px 15px rgba(0, 0, 0, 0.1);
  background: #fff;
  padding: 12px;
}

.slideshow-frame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 12px solid white;
  border-radius: 20px;
  z-index: 10;
  pointer-events: none;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
}

.slides-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
  overflow: hidden;
  border-radius: 10px;
}

.slide.active {
  opacity: 1;
  z-index: 1;
}

.image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.caption-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.caption {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4), transparent);
  color: white;
  padding: 25px 20px 15px;
  font-size: 1.2rem;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease-in-out 0.5s;
  border-radius: 0 0 10px 10px;
  font-family: 'Dancing Script', cursive;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.caption-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .slideshow-container {
    height: 350px;
    padding: 8px;
  }
  
  .slideshow-frame {
    border-width: 8px;
  }
  
  .caption-container {
    height: 80px;
  }
  
  .caption {
    font-size: 1rem;
    padding: 20px 15px 12px;
  }
}

@media (max-width: 480px) {
  .slideshow-container {
    height: 280px;
    padding: 6px;
  }
  
  .slideshow-frame {
    border-width: 6px;
  }
  
  .caption-container {
    height: 70px;
  }
  
  .caption {
    font-size: 0.9rem;
    padding: 15px 10px 10px;
  }
}
</style> 