<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Import our quality selection composable
const { useUpscaledImages, getQualityAssetPath, cachedVideos } = useQualitySelection()

// Track current state
const isTyping = ref(false)
const typedText = ref('')
const isPortrait = ref(false)
const isFadingIn = ref(true)
const isFadingOut = ref(false)

// Audio elements for voice narration
const firstLineAudio = ref(null)
const secondLineAudio = ref(null)
const isFirstAudioPlaying = ref(false)
const isSecondAudioPlaying = ref(false)

// Text content for typewriter effect
const dialogueLines = [
  "Distance means nothing…",
  "…when a heart knows where it belongs."
]

// Current line being typed
const currentLine = ref(0)

// Check device orientation
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  
  // Initialize audio elements
  firstLineAudio.value = new Audio('/assets/voice/Distance means nothing .wav')
  secondLineAudio.value = new Audio('/assets/voice/when a heart knows.wav')
  
  // Add event listeners for audio completion
  firstLineAudio.value.addEventListener('ended', () => {
    isFirstAudioPlaying.value = false
    // Only proceed to next line if we're still on the first line
    if (currentLine.value === 0) {
      setTimeout(() => {
        currentLine.value++
        typedText.value = ''
        startTypewriter()
      }, 1500) // Pause before next line
    }
  })
  
  secondLineAudio.value.addEventListener('ended', () => {
    isSecondAudioPlaying.value = false
  })
  
  // Start fade in effect
  setTimeout(() => {
    isFadingIn.value = false
    // Start typing after fade in completes
    setTimeout(() => {
      startTypewriter()
    }, 500)
  }, 500)
  
  // Set up video end event to navigate to the next page
  const video = document.querySelector('video')
  if (video) {
    video.onended = () => {
      isFadingOut.value = true
      setTimeout(() => {
        navigateTo('/fourth')
      }, 1000)
    }
  } else {
    // Fallback if video element is not found
    setTimeout(() => {
      isFadingOut.value = true
      setTimeout(() => {
        navigateTo('/fourth')
      }, 1000)
    }, 15000) // Approximate video duration
  }
})

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation)
  
  // Clean up audio event listeners
  if (firstLineAudio.value) {
    firstLineAudio.value.pause()
    firstLineAudio.value.removeEventListener('ended', () => {})
  }
  
  if (secondLineAudio.value) {
    secondLineAudio.value.pause()
    secondLineAudio.value.removeEventListener('ended', () => {})
  }
})

function checkOrientation() {
  isPortrait.value = window.innerHeight > window.innerWidth
}

// Play the appropriate audio based on current line
function playLineAudio() {
  // Get the background music plugin
  const { $bgMusic } = useNuxtApp()
  
  // Decrease background music volume before playing audio
  $bgMusic.decreaseVolume()
  
  if (currentLine.value === 0) {
    isFirstAudioPlaying.value = true
    firstLineAudio.value.play()
      .catch(error => {
        console.error('Error playing first line audio:', error)
        isFirstAudioPlaying.value = false
        // Restore volume if audio fails to play
        $bgMusic.restoreVolume()
      })
      
    // Add event listener to restore volume when audio ends
    firstLineAudio.value.addEventListener('ended', () => {
      $bgMusic.restoreVolume()
    }, { once: true })
  } else if (currentLine.value === 1) {
    isSecondAudioPlaying.value = true
    secondLineAudio.value.play()
      .catch(error => {
        console.error('Error playing second line audio:', error)
        isSecondAudioPlaying.value = false
        // Restore volume if audio fails to play
        $bgMusic.restoreVolume()
      })
      
    // Add event listener to restore volume when audio ends
    secondLineAudio.value.addEventListener('ended', () => {
      $bgMusic.restoreVolume()
    }, { once: true })
  }
}

// Typewriter effect function
function startTypewriter() {
  if (currentLine.value >= dialogueLines.length) {
    isTyping.value = false
    return
  }
  
  isTyping.value = true
  const line = dialogueLines[currentLine.value]
  let charIndex = 0
  
  // Play the audio for the current line
  playLineAudio()
  
  const typeInterval = setInterval(() => {
    if (charIndex < line.length) {
      typedText.value = line.substring(0, charIndex + 1)
      charIndex++
    } else {
      clearInterval(typeInterval)
      
      // For the first line, we'll let the audio ended event handle the transition
      // For the second line, we don't need to do anything special as the video end will handle navigation
      
      // If audio is not playing (maybe it failed to play), fall back to the original behavior
      if (currentLine.value === 0 && !isFirstAudioPlaying.value) {
        setTimeout(() => {
          currentLine.value++
          typedText.value = ''
          startTypewriter()
        }, 1500) // Pause before next line
      }
    }
  }, 50) // Speed of typing
}

// Computed class for dialogue box position
const dialogueBoxClass = computed(() => {
  return isPortrait.value ? 'dialogue-box-portrait' : 'dialogue-box-landscape'
})

// Computed property for video path
const backgroundVideoPath = computed(() => {
  const normalPath = isPortrait.value 
    ? '/assets/9-16/videos/map_anim.mp4' 
    : '/assets/16-9/videos/map_anim.mp4'
  const upscaledPath = isPortrait.value 
    ? '/assets/9-16/videos/map_anim_upscale.mp4' 
    : '/assets/16-9/videos/map_anim_upscale.mp4'
    
  // Use the getQualityAssetPath function to determine which path to use
  return getQualityAssetPath(normalPath, upscaledPath)
})
</script>

<template>
  <div 
    class="main-container" 
    :class="{ 'fade-in': isFadingIn, 'fade-out': isFadingOut }"
  >
    <!-- Background video -->
    <div class="background-video">
      <video 
        :src="backgroundVideoPath" 
        autoplay
        muted
        :class="isPortrait ? 'portrait-video' : 'landscape-video'"
      ></video>
    </div>
    
    <!-- Glass dialogue box -->
    <div :class="['glass-dialogue', dialogueBoxClass]">
      <div class="dialogue-content">
        <p class="typed-text">{{ typedText }}<span class="cursor" v-if="isTyping">|</span></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  transition: opacity 1s ease;
}

.fade-in {
  opacity: 0;
}

.fade-out {
  opacity: 0;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.landscape-video, .portrait-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Enhanced glass effect styling */
.glass-dialogue {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  padding: 35px;
  z-index: 10;
  position: absolute;
  transition: all 0.5s ease;
  overflow: hidden;
}

/* Add subtle gradient overlay */
.glass-dialogue::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  z-index: -1;
  border-radius: 20px;
}

/* Center positioning for message */
.dialogue-box-landscape {
  left: 5%;
  bottom: 10%;
  width: 40%;
  max-width: 500px;
  transform: none;
}

/* Portrait positioning */
.dialogue-box-portrait {
  left: 50%;
  bottom: 10%;
  transform: translateX(-50%);
  width: 85%;
  max-width: 500px;
}

.dialogue-content {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
}

.typed-text {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: 1.9rem;
  line-height: 1.7;
  min-height: 6rem; /* Space for 2 lines */
  margin-bottom: 25px;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Media queries for different screen sizes */
@media (max-width: 768px) {
  .typed-text {
    font-size: 1.6rem;
    min-height: 5rem;
  }
  
  .glass-dialogue {
    padding: 25px;
    width: 90%;
  }
}

@media (max-width: 480px) {
  .typed-text {
    font-size: 1.3rem;
    min-height: 4rem;
  }
  
  .glass-dialogue {
    padding: 20px;
    width: 95%;
  }
}
</style>