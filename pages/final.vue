<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'

// Import our quality selection composable
const { useUpscaledImages, getQualityAssetPath } = useQualitySelection()

// Animation timing constants
const TYPING_SPEED = 50 // ms per character
const PAUSE_BETWEEN_LINES = 1500 // ms pause after each line
const VIDEO_START_BEFORE_END = 7000 // ms before typing ends to start video
const FADE_TRANSITION_TIME = 500 // ms for fade transitions

// Track current state
const isTyping = ref(false)
const typedText = ref('')
const showTapPrompt = ref(false)
const tapPromptOpacity = ref(0)
const isPortrait = ref(false)
const isFadingIn = ref(true)

const showVideo = ref(false)

// Audio elements for voice narration
const firstLineAudio = ref(null)
const secondLineAudio = ref(null)
const isAudioPlaying = ref(false)

// Store interval IDs for cleanup
let tapPromptAnimationInterval = null
let typewriterInterval = null

// Text content for typewriter effect
const dialogueLines = [
  "And now that you hold it… it's yours, forever.",
  "From Bangladesh, with all my love… Happy Birthday!"
]

// Current line being typed
const currentLine = ref(0)

// Check device orientation
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  
  // Initialize audio elements
  firstLineAudio.value = new Audio('/assets/voice/And now that you hold it.wav')
  secondLineAudio.value = new Audio('/assets/voice/From Bangladesh, with all my love.wav')
  
  // Add event listeners for audio completion
  firstLineAudio.value.addEventListener('ended', () => {
    isAudioPlaying.value = false
    // Move to next line after first audio ends
    setTimeout(() => {
      currentLine.value++
      if (currentLine.value < dialogueLines.length) {
        typedText.value = ''
        startTypewriter()
      }
    }, PAUSE_BETWEEN_LINES)
  })
  
  secondLineAudio.value.addEventListener('ended', () => {
    isAudioPlaying.value = false
    // Show tap prompt after second audio ends
    showTapPrompt.value = true
    startTapPromptAnimation()
  })
  
  // Start fade in effect
  setTimeout(() => {
    isFadingIn.value = false
    // Start typing after fade in completes
    setTimeout(() => {
      startTypewriter()
    }, FADE_TRANSITION_TIME)
  }, FADE_TRANSITION_TIME)
})

onUnmounted(() => {
  // Clean up event listeners and intervals
  window.removeEventListener('resize', checkOrientation)
  if (tapPromptAnimationInterval) clearInterval(tapPromptAnimationInterval)
  if (typewriterInterval) clearInterval(typewriterInterval)
  
  // Clean up audio resources
  if (firstLineAudio.value) {
    firstLineAudio.value.pause()
    firstLineAudio.value.removeEventListener('ended', () => {})
  }
  if (secondLineAudio.value) {
    secondLineAudio.value.pause()
    secondLineAudio.value.removeEventListener('ended', () => {})
  }
})

// Function to play the appropriate audio for the current line
function playLineAudio() {
  // Get the background music plugin
  const { $bgMusic } = useNuxtApp()
  
  // Decrease background music volume before playing audio
  $bgMusic.decreaseVolume()
  
  isAudioPlaying.value = true
  
  if (currentLine.value === 0) {
    firstLineAudio.value.play().catch(error => {
      console.error('Error playing first line audio:', error)
      isAudioPlaying.value = false
      // Restore volume if audio fails to play
      $bgMusic.restoreVolume()
      
      // Fallback if audio fails: move to next line after typing completes
      const line = dialogueLines[currentLine.value]
      const typingTime = line.length * TYPING_SPEED
      
      setTimeout(() => {
        currentLine.value++
        if (currentLine.value < dialogueLines.length) {
          typedText.value = ''
          startTypewriter()
        }
      }, typingTime + PAUSE_BETWEEN_LINES)
    })
    
    // Add event listener to restore volume when audio ends
    firstLineAudio.value.addEventListener('ended', () => {
      $bgMusic.restoreVolume()
    }, { once: true })
  } else if (currentLine.value === 1) {
    secondLineAudio.value.play().catch(error => {
      console.error('Error playing second line audio:', error)
      isAudioPlaying.value = false
      // Restore volume if audio fails to play
      $bgMusic.restoreVolume()
      
      // Fallback if audio fails: show tap prompt after typing completes
      const line = dialogueLines[currentLine.value]
      const typingTime = line.length * TYPING_SPEED
      
      setTimeout(() => {
        showTapPrompt.value = true
        startTapPromptAnimation()
      }, typingTime + PAUSE_BETWEEN_LINES)
    })
    
    // Add event listener to restore volume when audio ends
    secondLineAudio.value.addEventListener('ended', () => {
      $bgMusic.restoreVolume()
    }, { once: true })
  }
}

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

// Add this to your reactive variables
const videoPlaying = ref(false)

// Update the watch function for showVideo
watch(showVideo, (newValue) => {
  if (newValue) {
    const videoElement = document.querySelector('video')
    if (videoElement) {
      // Make sure video is loaded before playing
      if (videoElement.readyState >= 2) {
        videoElement.play()
          .then(() => {
            // Wait a short moment before removing the background image
            setTimeout(() => {
              videoPlaying.value = true
            }, 300) // Adjust this delay as needed
          })
          .catch(error => {
            console.error('Error playing video:', error)
          })
      } else {
        // If not loaded yet, wait for it
        videoElement.addEventListener('loadeddata', () => {
          videoElement.play()
            .then(() => {
              // Wait a short moment before removing the background image
              setTimeout(() => {
                videoPlaying.value = true
              }, 300) // Adjust this delay as needed
            })
            .catch(error => {
              console.error('Error playing video:', error)
            })
        }, { once: true })
      }
    }
  } else {
    videoPlaying.value = false
  }
})

function checkOrientation() {
  isPortrait.value = window.innerHeight > window.innerWidth
}

// Typewriter effect function
function startTypewriter() {
  // Clear any existing interval
  if (typewriterInterval) {
    clearInterval(typewriterInterval)
  }
  
  if (currentLine.value >= dialogueLines.length) {
    isTyping.value = false
    showTapPrompt.value = true
    startTapPromptAnimation()
    return
  }
  
  // Play audio for the current line
  playLineAudio()
  
  // Calculate total typewriter animation time for ALL dialogue lines combined
  let totalTypingTime = 0
  
  // Sum the time for all lines (each character typing + pause after each line)
  dialogueLines.forEach((line, index) => {
    // Add time for each character in this line
    totalTypingTime += line.length * TYPING_SPEED
    
    // Add pause after line (except for the last line)
    if (index < dialogueLines.length - 1) {
      totalTypingTime += PAUSE_BETWEEN_LINES
    }
  })
  
  console.log(`Total typewriter animation time: ${totalTypingTime}ms for ${dialogueLines.length} lines`)
  
  // Video playback timing calculation:
  // If total animation time > VIDEO_START_BEFORE_END (7 seconds):
  //   - Start video 7 seconds before animation ends
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
  
  isTyping.value = true
  const line = dialogueLines[currentLine.value]
  let charIndex = 0
  
  typewriterInterval = setInterval(() => {
    if (charIndex < line.length) {
      typedText.value = line.substring(0, charIndex + 1)
      charIndex++
    } else {
      clearInterval(typewriterInterval)
      typewriterInterval = null
      
      // Don't automatically move to next line or show tap prompt here
      // Audio ended event will handle this instead
      
      // Fallback if audio doesn't trigger ended event
      if (!isAudioPlaying.value) {
        setTimeout(() => {
          currentLine.value++
          if (currentLine.value < dialogueLines.length) {
            typedText.value = ''
            startTypewriter()
          } else {
            showTapPrompt.value = true
            startTapPromptAnimation()
          }
        }, PAUSE_BETWEEN_LINES)
      }
    }
  }, TYPING_SPEED) // Speed of typing
}

// Animate the tap prompt with fade in/out effect
function startTapPromptAnimation() {
  // Clear any existing interval
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

// Function to go to the gift page
function goToGiftPage() {
  if (!showTapPrompt.value) return
  
  setTimeout(() => {
    navigateTo('/gift')
  }, FADE_TRANSITION_TIME)
}

// Computed class for dialogue box position
const dialogueBoxClass = computed(() => {
  return isPortrait.value ? 'dialogue-box-portrait' : 'dialogue-box-landscape'
})

// Computed properties for image and video paths
const backgroundImagePath = computed(() => {
  const normalPath = isPortrait.value 
    ? '/assets/9-16/normal_images/girl_grabing_love.jpg' 
    : '/assets/16-9/normal_images/girl_grabing_love.jpg'
  const upscaledPath = isPortrait.value 
    ? '/assets/9-16/upscaled_images/girl_grabing_love.png' 
    : '/assets/16-9/upscaled_images/girl_grabing_love.png'
  return getQualityAssetPath(normalPath, upscaledPath)
})

const backgroundVideoPath = computed(() => {
  // Videos don't change based on quality selection for this page
  return isPortrait.value 
    ? '/assets/9-16/videos/girl_grabing_love.mp4' 
    : '/assets/16-9/videos/girl_grabing_love.mp4'
})
</script>

<template>
  <div 
    class="main-container" 
    :class="{ 'fade-in': isFadingIn }"
    @click="goToGiftPage"
  >
    <!-- Background image or video -->
    <div class="background-image">
      <!-- Static image shown initially -->
      <img 
        v-if="!videoPlaying"
        :src="backgroundImagePath" 
        :class="isPortrait ? 'portrait-image' : 'landscape-image'"
        alt="Girl grabbing love"
      />
      
      <!-- Video shown after text animation -->
      <video
        ref="videoElement"
        :src="backgroundVideoPath"
        :class="isPortrait ? 'portrait-image' : 'landscape-image'"
        muted
        playsinline
        loop
        preload="auto"
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
          tap to open gift
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
  transition: opacity 0.5s ease;
  cursor: pointer;
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
}

video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Floating hearts */
.floating-hearts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  animation: fadeIn 1s ease forwards;
}

.heart {
  position: absolute;
  font-size: 2rem;
  animation-name: float-heart;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-duration: 6s;
}

.heart1 {
  left: 10%;
  top: 20%;
  animation-delay: 0s;
}

.heart2 {
  left: 30%;
  top: 70%;
  animation-delay: 1s;
}

.heart3 {
  left: 70%;
  top: 30%;
  animation-delay: 2s;
}

.heart4 {
  left: 85%;
  top: 60%;
  animation-delay: 3s;
}

.heart5 {
  left: 50%;
  top: 15%;
  animation-delay: 4s;
}

.heart6 {
  left: 20%;
  top: 40%;
  animation-delay: 2.5s;
}

.heart7 {
  left: 75%;
  top: 80%;
  animation-delay: 1.5s;
}

@keyframes float-heart {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Left side positioning for landscape */
.dialogue-box-landscape {
  left: 5%;
  top: 50%;
  transform: translateY(-50%);
  width: 40%;
  max-width: 500px;
}

/* Bottom positioning for portrait */
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
  min-height: 8rem; /* Space for 2 lines */
  margin-bottom: 25px;
  font-weight: 700;
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
    font-size: 1.5rem;
    min-height: 6rem;
  }
  
  .tap-prompt {
    font-size: 1rem;
  }
  
  .glass-dialogue {
    padding: 25px;
    width: 90%;
  }
  
  .heart {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .typed-text {
    font-size: 1.2rem;
    min-height: 5rem;
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