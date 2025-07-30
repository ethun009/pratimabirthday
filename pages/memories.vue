<template>
  <div class="memories-container">
    <!-- Top Left: Countdown Timer Section -->
    <div class="section top-left">
      <div class="section-content">
        <CountdownTimer startDate="2025-06-01" />
        <p class="date-text">Since June 1st, when we first met</p>
      </div>
    </div>

    <!-- Top Right: Slideshow Section -->
    <div class="section top-right">
      <div class="section-content">
        <MemorySlideshow />
      </div>
    </div>

    <!-- Bottom Left: Music Controls -->
    <div class="section bottom-left">
      <div class="section-content">
        <MusicPlayer 
          @song-change="handleSongChange"
          @playback-state="handlePlaybackState"
          @time-update="handleTimeUpdate"
        />
      </div>
    </div>

    <!-- Bottom Right: Lyrics Display -->
    <div class="section bottom-right">
      <div class="section-content">
        <LyricsDisplay 
          :currentSongId="currentSongId"
          :isPlaying="isPlaying"
          :currentTime="currentTime"
        />
      </div>
    </div>

    <!-- Floating Elements -->
    <FloatingElements />

    <!-- Animated Text at Bottom -->
    <div class="bottom-animated-text">
      <TypewriterText 
        :phrases="[
          'Every moment with you is a memory I treasure...',
          'Distance is just a test to see how far love can travel...',
          'In your eyes, I found my home...',
          'Your smile is my favorite work of art...'
        ]" 
      />
    </div>
  </div>
</template>

<script setup>
// Import components
import { ref } from 'vue';
import CountdownTimer from '~/components/CountdownTimer.vue';
import MemorySlideshow from '~/components/MemorySlideshow.vue';
import FloatingElements from '~/components/FloatingElements.vue';
import TypewriterText from '~/components/TypewriterText.vue';
import MusicPlayer from '~/components/MusicPlayer.vue';
import LyricsDisplay from '~/components/LyricsDisplay.vue';

// State for connecting MusicPlayer and LyricsDisplay
const currentSongId = ref(1);
const isPlaying = ref(false);
const currentTime = ref(0);

// Event handlers for MusicPlayer
const handleSongChange = (songId) => {
  currentSongId.value = songId;
};

const handlePlaybackState = (playing) => {
  isPlaying.value = playing;
};

const handleTimeUpdate = (time) => {
  currentTime.value = time;
};
</script>

<style scoped>
.memories-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f5e6ea 0%, #e2d1f9 100%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 70% 30%;
  grid-template-areas:
    "top-left top-right"
    "bottom-left bottom-right";
  gap: 20px;
  padding: 20px;
}

.section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 32px rgba(156, 107, 148, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.section:hover {
  background-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(156, 107, 148, 0.25);
  transform: translateY(-5px);
}

.section-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.top-left {
  grid-area: top-left;
}

.top-right {
  grid-area: top-right;
}

.bottom-left {
  grid-area: bottom-left;
}

.bottom-right {
  grid-area: bottom-right;
}

.date-text {
  margin-top: 15px;
  font-style: italic;
  color: #9c6b94;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
  text-align: center;
  font-size: 1.2rem;
}

.bottom-animated-text {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 10;
  background: linear-gradient(to top, rgba(245, 230, 234, 0.8), transparent);
  padding: 15px 0;
}

/* Lyrics section specific styling */
.bottom-right .section-content {
  max-height: 100%;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: #9c6b94 rgba(255, 255, 255, 0.2);
}

.bottom-right .section-content::-webkit-scrollbar {
  width: 6px;
}

.bottom-right .section-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.bottom-right .section-content::-webkit-scrollbar-thumb {
  background-color: #9c6b94;
  border-radius: 10px;
}

/* Responsive design */
@media (max-width: 768px) {
  .memories-container {
    height: auto;
    min-height: 100vh;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, minmax(300px, 1fr));
    grid-template-areas:
      "top-left"
      "top-right"
      "bottom-right"
      "bottom-left";
    overflow-y: auto;
    gap: 30px;
    padding: 30px 20px 80px 20px; /* Extra padding at bottom for animated text */
  }

  .section {
    min-height: 300px;
  }
  
  .top-left, .top-right, .bottom-left, .bottom-right {
    width: 100%;
  }
  
  .bottom-animated-text {
    position: fixed;
    bottom: 0;
    background: linear-gradient(to top, rgba(245, 230, 234, 0.9), rgba(245, 230, 234, 0.7));
    padding: 15px 0;
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
