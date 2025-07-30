<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// Import our quality selection composable
const { useUpscaledImages, getQualityAssetPath } = useQualitySelection()

// Track current state
const isTyping = ref(false)
const typedText = ref('')
const showTapPrompt = ref(false)
const tapPromptOpacity = ref(0)
const isPortrait = ref(false)
const isFadingOut = ref(false)
const isFadingIn = ref(true)
const showVideo = ref(false)

// Audio element for voice narration
const lineAudio = ref(null)
const isAudioPlaying = ref(false)

// Animation timing constants
const TYPING_SPEED = 50 // ms per character
const PAUSE_BETWEEN_LINES = 1000 // ms
const VIDEO_START_BEFORE_END = 5000 // ms
const FADE_TRANSITION_TIME = 1000 // ms

// Store intervals for cleanup
let tapPromptAnimationInterval = null
let typewriterInterval = null

// Text content for typewriter effect
const dialogueText = "With every beat of my heart, I send my love across the horizon…"

// Check device orientation
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  
  // Initialize audio element
  lineAudio.value = new Audio('/assets/voice/With every beat of my heart.wav')
  
  // Add event listener for audio completion
  lineAudio.value.addEventListener('ended', () => {
    isAudioPlaying.value = false
    // Show tap prompt when audio ends
    isTyping.value = false
    showTapPrompt.value = true
    startTapPromptAnimation()
  })
  
  // Start fade in effect
  setTimeout(() => {
    isFadingIn.value = false
    // Start typing after fade in completes
    setTimeout(() => {
      startTypewriter()
    }, 500)
  }, 500)
})

// Clean up event listeners and intervals when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation)
  
  // Clear any running intervals
  if (tapPromptAnimationInterval) {
    clearInterval(tapPromptAnimationInterval)
    tapPromptAnimationInterval = null
  }
  
  if (typewriterInterval) {
    clearInterval(typewriterInterval)
    typewriterInterval = null
  }
  
  // Clean up audio event listener
  // Clean up audio event listener
  if (lineAudio.value) {
    lineAudio.value.pause()
    lineAudio.value.removeEventListener('ended', () => {})
    // Make sure to remove the volume restoration listener too
    lineAudio.value.removeEventListener('ended', () => {})
  }
})

// Function to handle video playback
function playVideo() {
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    const videoElement = document.querySelector('video')
    if (videoElement) {
      videoElement.play()
        .catch(error => {
          console.error('Error playing video:', error)
        })
    }
  }, 100)
}

// Watch for showVideo changes to ensure video plays
watch(showVideo, (newValue) => {
  if (newValue) {
    playVideo()
  }
})

function checkOrientation() {
  isPortrait.value = window.innerHeight > window.innerWidth
}

// Play the audio for the dialogue line
function playLineAudio() {
  // Get the background music plugin
  const { $bgMusic } = useNuxtApp()
  
  // Decrease background music volume before playing audio
  $bgMusic.decreaseVolume()
  
  isAudioPlaying.value = true
  lineAudio.value.play()
    .catch(error => {
      console.error('Error playing audio:', error)
      isAudioPlaying.value = false
      // Restore volume if audio fails to play
      $bgMusic.restoreVolume()
    })
    
  // Add event listener to restore volume when audio ends
  lineAudio.value.addEventListener('ended', () => {
    $bgMusic.restoreVolume()
  }, { once: true })
}

// Typewriter effect function
function startTypewriter() {
  isTyping.value = true
  let charIndex = 0
  
  // Calculate total typing time for video timing
  const totalTypingTime = dialogueText.length * TYPING_SPEED + PAUSE_BETWEEN_LINES
  console.log(`Total typewriter animation time: ${totalTypingTime}ms`)
  
  // Video playback timing calculation:
  // If total animation time > VIDEO_START_BEFORE_END:
  //   - Start video before animation ends
  // If total animation time <= VIDEO_START_BEFORE_END:
  //   - Start video immediately
  const videoStartDelay = totalTypingTime > VIDEO_START_BEFORE_END ? 
    totalTypingTime - VIDEO_START_BEFORE_END : 0
  
  console.log(`Video will start after ${videoStartDelay}ms delay`)
  
  // If total time is less than VIDEO_START_BEFORE_END, show video immediately
  if (totalTypingTime <= VIDEO_START_BEFORE_END) {
    showVideo.value = true
  } else {
    // Otherwise, set a timer to show the video before animation ends
    setTimeout(() => {
      showVideo.value = true
    }, videoStartDelay)
  }
  
  // Clear any existing typewriter interval
  if (typewriterInterval) {
    clearInterval(typewriterInterval)
  }
  
  // Play the audio for the dialogue line
  playLineAudio()
  
  typewriterInterval = setInterval(() => {
    if (charIndex < dialogueText.length) {
      typedText.value = dialogueText.substring(0, charIndex + 1)
      charIndex++
    } else {
      clearInterval(typewriterInterval)
      typewriterInterval = null
      
      // If audio is not playing (maybe it failed to play), fall back to showing tap prompt
      if (!isAudioPlaying.value) {
        setTimeout(() => {
          isTyping.value = false
          showTapPrompt.value = true
          startTapPromptAnimation()
        }, PAUSE_BETWEEN_LINES) // Pause before showing tap prompt
      }
      // Otherwise, let the audio ended event handle showing the tap prompt
    }
  }, TYPING_SPEED) // Speed of typing
}

// Animate the tap prompt with fade in/out effect
function startTapPromptAnimation() {
  // Clear any existing animation interval
  if (tapPromptAnimationInterval) {
    clearInterval(tapPromptAnimationInterval)
  }
  
  let increasing = true
  tapPromptAnimationInterval = setInterval(() => {
    if (increasing) {
      tapPromptOpacity.value += 0.05
      if (tapPromptOpacity.value >= 1) {
        increasing = false
      }
    } else {
      tapPromptOpacity.value -= 0.05
      if (tapPromptOpacity.value <= 0.3) {
        increasing = true
      }
    }
  }, 50)
}

// Function to go to the final page
function goToNextStep() {
  if (!showTapPrompt.value) return
  
  isFadingOut.value = true
  setTimeout(() => {
    navigateTo('/third')
  }, FADE_TRANSITION_TIME) // Wait for fade out animation to complete
}

// Computed class for dialogue box position
const dialogueBoxClass = computed(() => {
  return isPortrait.value ? 'dialogue-box-portrait' : 'dialogue-box-landscape'
})

// Computed properties for image and video paths (moved from bottom script)
const backgroundImagePath = computed(() => {
  const normalPath = isPortrait.value 
    ? '/assets/9-16/normal_images/boy_sending_love.jpg' 
    : '/assets/16-9/normal_images/boy_sending_love.jpg'
  const upscaledPath = isPortrait.value 
    ? '/assets/9-16/upscaled_images/boy_sending_love.png' 
    : '/assets/16-9/upscaled_images/boy_sending_love.png'
  return getQualityAssetPath(normalPath, upscaledPath)
})

const backgroundVideoPath = computed(() => {
  // Videos don't change based on quality selection for this page
  return isPortrait.value 
    ? '/assets/9-16/videos/boy_sending_love.mp4' 
    : '/assets/16-9/videos/boy_sending_love.mp4'
})
</script>

<template>
  <div 
    class="main-container" 
    :class="{ 'fade-out': isFadingOut, 'fade-in': isFadingIn }"
    @click="goToNextStep"
  >
    <!-- Background image or video -->
    <div class="background-image">
      <!-- Static image shown initially -->
      <img 
        v-if="!showVideo"
        :src="backgroundImagePath" 
        :class="isPortrait ? 'portrait-image' : 'landscape-image'"
        alt="Boy sending love"
      />
      
      <!-- Video shown after text animation -->
      <video 
        v-if="showVideo"
        :src="backgroundVideoPath" 
        :class="isPortrait ? 'portrait-image' : 'landscape-image'"
        autoplay
        muted
      ></video>
    </div>
    
    <!-- Glass dialogue box -->
    <div :class="['glass-dialogue', dialogueBoxClass]">
      <div class="dialogue-content">
        <p class="typed-text">{{ typedText }}<span class="cursor" v-if="isTyping">|</span></p>
        <p 
          v-if="showTapPrompt" 
          class="tap-prompt"
          :style="{ opacity: tapPromptOpacity }"
        >
          tap to continue
        </p>
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
  transition: opacity v-bind('FADE_TRANSITION_TIME + "ms"') ease;
  cursor: pointer;
}

.fade-out {
  opacity: 0;
}

.fade-in {
  opacity: 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.landscape-image, .portrait-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}

video.landscape-image, video.portrait-image {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
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

/* Landscape positioning - right side for second page */
.dialogue-box-landscape {
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  width: 40%;
  max-width: 500px;
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
  font-size: 1.6rem;
  line-height: 1.7;
  min-height: 5.1rem; /* Space for text */
  margin-bottom: 25px;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.cursor {
  animation: blink 1s infinite;
}

.tap-prompt {
  font-size: 1.1rem;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 10px;
  transition: opacity 0.5s ease;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Media queries for different screen sizes */
@media (max-width: 768px) {
  .typed-text {
    font-size: 1.3rem;
    min-height: 4.5rem;
  }
  
  .tap-prompt {
    font-size: 1rem;
  }
  
  .glass-dialogue {
    padding: 25px;
  }
}

@media (max-width: 480px) {
  .typed-text {
    font-size: 1.1rem;
    min-height: 4rem;
  }
  
  .dialogue-box-portrait {
    bottom: 15%;
    width: 90%;
  }
  
  .tap-prompt {
    font-size: 0.9rem;
  }
}
</style>
