<template>
  <div class="music-player">
    <div class="player-background"></div>
    
    <!-- Left side: Vinyl (30%) -->
    <div class="player-left">
      <div class="vinyl-container" :class="{ 'rotating': isPlaying }">
        <div class="vinyl-disc">
          <div class="vinyl-label">
            <div class="vinyl-hole"></div>
            <div class="vinyl-artist">{{ currentSong.artist }}</div>
          </div>
          <div class="vinyl-grooves"></div>
        </div>
        <div class="vinyl-reflection"></div>
      </div>
    </div>
    
    <!-- Right side: Controls (70%) -->
    <div class="player-right">
      <!-- Song info at top -->
      <div class="music-info">
        <div class="song-title">{{ currentSong.title }}</div>
        <div class="artist">{{ currentSong.artist }}</div>
      </div>
      
      <!-- Controls in middle -->
      <div class="controls">
        <button @click="previousSong" class="control-btn prev-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        
        <button @click="togglePlay" class="control-btn play-btn" :class="{ 'active': isPlaying }">
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        
        <button @click="nextSong" class="control-btn next-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>
      
      <!-- Seekbar at bottom -->
      <div class="seekbar-container">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
        
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
    
    <audio 
      ref="audioPlayer" 
      @ended="handleEnded" 
      @timeupdate="updateProgress" 
      @loadedmetadata="setDuration"
      :src="currentSong.src"
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// Playlist with local song files
const playlist = [
  {
    id: 1,
    title: "Bhalobashi Bole Dao",
    artist: "Bengali Love Song",
    src: "/assets/songs/Bhalobashi Bole Dao.mp3"
  },
  {
    id: 2,
    title: "Timro Pratiksa",
    artist: "Nepali Melody",
    src: "/assets/songs/Timro Pratiksa.mp3"
  },
  {
    id: 3,
    title: "Tum Jo Aaye",
    artist: "Bollywood Romance",
    src: "/assets/songs/Tum Jo Aaye.mp3"
  }
];

const currentSongIndex = ref(2); // Start with the third song (Tum Jo Aaye)
const isPlaying = ref(false);
const audioPlayer = ref(null);
const currentSong = ref(playlist[2]); // Set initial song to Tum Jo Aaye
const progress = ref(0);
const currentTime = ref(0);
const duration = ref(0);

const togglePlay = () => {
  if (isPlaying.value) {
    audioPlayer.value.pause();
  } else {
    audioPlayer.value.play().catch(error => {
      console.error("Error playing audio:", error);
    });
  }
  isPlaying.value = !isPlaying.value;
  
  // Emit playback state change
  emit('playback-state', isPlaying.value);
};

const nextSong = () => {
  currentSongIndex.value = (currentSongIndex.value + 1) % playlist.length;
  currentSong.value = playlist[currentSongIndex.value];
  resetPlayer();
  
  // Emit song change event
  emit('song-change', currentSong.value.id);
};

const previousSong = () => {
  currentSongIndex.value = (currentSongIndex.value - 1 + playlist.length) % playlist.length;
  currentSong.value = playlist[currentSongIndex.value];
  resetPlayer();
  
  // Emit song change event
  emit('song-change', currentSong.value.id);
};

const handleEnded = () => {
  nextSong();
  
  // Ensure the next song plays automatically
  setTimeout(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play().catch(error => {
        console.error("Error auto-playing next song:", error);
      });
    }
  }, 100);
};

const updateProgress = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime;
    progress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100 || 0;
    
    // Emit time update event
    emit('time-update', currentTime.value);
  }
};

const setDuration = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration;
  }
};

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00';
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const resetPlayer = () => {
  progress.value = 0;
  currentTime.value = 0;
  
  // Always play the song after reset, regardless of previous state
  // Small timeout to ensure the new audio source is loaded
  setTimeout(() => {
    audioPlayer.value.play().then(() => {
      isPlaying.value = true;
      // Emit playback state change
      emit('playback-state', isPlaying.value);
    }).catch(error => {
      console.error("Error playing audio:", error);
    });
  }, 100);
};

// Define emits
const emit = defineEmits(['song-change', 'playback-state', 'time-update']);

// Watch for song changes to emit event
watch(currentSongIndex, (newIndex) => {
  // Emit song change event with the song ID
  emit('song-change', currentSong.value.id);
});

onMounted(() => {
  // Preload audio
  if (audioPlayer.value) {
    audioPlayer.value.load();
    
    // Auto-play when component is mounted
    setTimeout(() => {
      audioPlayer.value.play().then(() => {
        isPlaying.value = true;
        // Emit playback state change
        emit('playback-state', isPlaying.value);
      }).catch(error => {
        console.error("Error auto-playing audio:", error);
      });
    }, 1000); // Small delay to ensure audio is loaded
  }
  
  // Emit initial song ID
  emit('song-change', currentSong.value.id);
});

onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  }
});
</script>

<style scoped>
.music-player {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 
    0 10px 30px rgba(156, 107, 148, 0.3),
    inset 0 0 15px rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 500px;
  height: 180px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.player-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 107, 149, 0.2), transparent 70%),
              radial-gradient(circle at 70% 70%, rgba(156, 107, 148, 0.2), transparent 70%);
  z-index: -1;
}

/* Left side (30%) */
.player-left {
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 15px;
}

/* Right side (70%) */
.player-right {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* Vinyl styling */
.vinyl-container {
  position: relative;
  width: 120px;
  height: 120px;
  perspective: 1000px;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #111;
  position: relative;
  box-shadow: 
    0 0 30px rgba(0, 0, 0, 0.5),
    0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  transition: transform 0.5s ease-out;
}

.vinyl-grooves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    rgba(30, 30, 30, 0.9) 0px,
    rgba(30, 30, 30, 0.9) 1px,
    rgba(10, 10, 10, 0.9) 1px,
    rgba(10, 10, 10, 0.9) 3px
  );
  opacity: 0.8;
}

.vinyl-label {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b95 0%, #ffc2d1 100%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.vinyl-hole {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #000;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.vinyl-artist {
  font-size: 0.4rem;
  color: white;
  text-align: center;
  margin-top: 3px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  max-width: 40px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vinyl-reflection {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  z-index: 3;
  pointer-events: none;
}

.rotating {
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Music info styling */
.music-info {
  width: 100%;
  text-align: left;
  margin-bottom: 5px;
}

.song-title {
  font-weight: bold;
  color: #ff6b95;
  font-size: 1.2rem;
  margin-bottom: 3px;
  text-shadow: 0 0 10px rgba(255, 107, 149, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
      text-align: center;
}

.artist {
  color: #9c6b94;
  font-size: 0.9rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
      text-align: center;
}

/* Controls styling */
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 5px 0;
}

.control-btn {
  background: none;
  border: none;
  color: #9c6b94;
  cursor: pointer;
  margin: 0 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  color: #ff6b95;
}

.control-btn svg {
  width: 24px;
  height: 24px;
}

.play-btn {
  background: rgba(255, 255, 255, 0.15);
  width: 50px;
  height: 50px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.play-btn.active {
  background: rgba(255, 107, 149, 0.3);
  box-shadow: 0 0 15px rgba(255, 107, 149, 0.5);
  color: #fff;
}

/* Seekbar styling */
.seekbar-container {
  width: 100%;
}

.progress-container {
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  margin-bottom: 8px;
  overflow: hidden;
  cursor: pointer;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b95 0%, #ffc2d1 100%);
  border-radius: 5px;
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(255, 107, 149, 0.5);
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #9c6b94;
  padding: 0 2px;
}

/* Responsive design */
@media (max-width: 500px) {
  .music-player {
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  
  .player-left {
    width: 100%;
    padding-right: 0;
    padding-bottom: 15px;
  }
  
  .player-right {
    width: 100%;
    padding-left: 0;
    padding-top: 15px;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .vinyl-container {
    width: 100px;
    height: 100px;
  }
  
  .vinyl-label {
    width: 35px;
    height: 35px;
  }
  
  .control-btn {
    width: 35px;
    height: 35px;
    margin: 0 8px;
  }
  
  .play-btn {
    width: 45px;
    height: 45px;
  }
  
  .song-title {
    font-size: 1.1rem;
  }
  
  .artist {
    font-size: 0.8rem;
  }
}
</style>