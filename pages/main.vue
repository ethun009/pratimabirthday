<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// Track current state
const currentStep = ref(0)
const isTyping = ref(false)
const typedText = ref('')
const showTapPrompt = ref(false)
const tapPromptOpacity = ref(0)
const isPortrait = ref(false)
const isFadingOut = ref(false)
const showVideo = ref(false)

// Audio elements for voice narration
const firstLineAudio = ref(null)
const secondLineAudio = ref(null)
const isFirstAudioPlaying = ref(false)
const isSecondAudioPlaying = ref(false)

// Animation timing constants
const TYPING_SPEED = 50 // ms per character
const PAUSE_BETWEEN_LINES = 1500 // ms
const VIDEO_START_BEFORE_END = 5000 // ms
const FADE_TRANSITION_TIME = 1000 // ms

// Store intervals for cleanup
let tapPromptAnimationInterval = null
let typewriterInterval = null

// Text content for typewriter effect
const dialogueLines = [
  "Somewhere far away, under the same sky… I think of you.",
  "And in that moment, the world feels a little closer."
]

// Current line being typed
const currentLine = ref(0)

// Updated paths to match exactly with the files in public directory
const slides = [
  {
    title: "The Beginning",
    description: "Miles apart, but connected by heart.",
    image: "/assets/16-9/normal_images/boy_standing.jpg",
    verticalImage: "/assets/9-16/normal_images/boy_standing.jpg"
  },
  {
    title: "Sending Love",
    description: "No distance is too far for love to reach.",
    video: "/assets/16-9/videos/boy_sending_love.mp4",
    verticalVideo: "/assets/9-16/videos/map_anim.mp4"
  },
  {
    title: "Across the World",
    description: "Love travels across continents and oceans.",
    image: "/assets/16-9/normal_images/girl_catching_love.jpg",
    verticalImage: "/assets/9-16/normal_images/girl_catching_love.jpg"
  },
  {
    title: "Receiving Love",
    description: "The moment when love is received.",
    video: "/assets/16-9/videos/girl_grabing_love.mp4",
    verticalVideo: "/assets/9-16/normal_images/girl_grabing_love.jpg"
  },
  {
    title: "Forever Connected",
    description: "No matter the distance, our hearts are always connected.",
    image: "/assets/16-9/normal_images/girl_grabing_love.jpg",
    verticalImage: "/assets/9-16/normal_images/boy_sending_love.jpg"
  }
]

// Check device orientation
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  
  // Initialize audio elements
  firstLineAudio.value = new Audio('/assets/voice/Somewhere far away, under the same sky… I think of you.wav')
  secondLineAudio.value = new Audio('/assets/voice/And in that moment.wav')
  
  // Add event listeners for audio completion
  firstLineAudio.value.addEventListener('ended', () => {
    isFirstAudioPlaying.value = false
    // Only proceed to next line if we're still on the first line
    if (currentLine.value === 0) {
      setTimeout(() => {
        currentLine.value++
        typedText.value = ''
        startTypewriter()
      }, PAUSE_BETWEEN_LINES)
    }
  })
  
  secondLineAudio.value.addEventListener('ended', () => {
    isSecondAudioPlaying.value = false
    // If this is the last line, show tap prompt
    if (currentLine.value === dialogueLines.length - 1) {
      isTyping.value = false
      showTapPrompt.value = true
      startTapPromptAnimation()
    }
  })
  
  startTypewriter()
  
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
  
  // If we've reached the end of all dialogue lines
  if (currentLine.value >= dialogueLines.length) {
    isTyping.value = false
    showTapPrompt.value = true
    startTapPromptAnimation()
    return
  }
  
  // Start typing the current line
  isTyping.value = true
  const line = dialogueLines[currentLine.value]
  let charIndex = 0
  
  // Clear any existing typewriter interval
  if (typewriterInterval) {
    clearInterval(typewriterInterval)
  }
  
  // Play the audio for the current line
  playLineAudio()
  
  typewriterInterval = setInterval(() => {
    if (charIndex < line.length) {
      typedText.value = line.substring(0, charIndex + 1)
      charIndex++
    } else {
      clearInterval(typewriterInterval)
      typewriterInterval = null
      
      // For the first line, we'll let the audio ended event handle the transition
      // For the second line, we'll also let the audio ended event handle showing the tap prompt
      // So we don't need the setTimeout logic here anymore
      
      // If audio is not playing (maybe it failed to play), fall back to the original behavior
      if (currentLine.value === 0 && !isFirstAudioPlaying.value) {
        setTimeout(() => {
          currentLine.value++
          typedText.value = ''
          startTypewriter()
        }, PAUSE_BETWEEN_LINES)
      } else if (currentLine.value === 1 && !isSecondAudioPlaying.value) {
        isTyping.value = false
        showTapPrompt.value = true
        startTapPromptAnimation()
      }
    }
  }, TYPING_SPEED)
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

// Function to go to the next step
function goToNextStep() {
  if (!showTapPrompt.value) return
  
  isFadingOut.value = true
  setTimeout(() => {
    navigateTo('/second')
  }, FADE_TRANSITION_TIME) // Wait for fade out animation to complete
}

// Computed class for dialogue box position
const dialogueBoxClass = computed(() => {
  return isPortrait.value ? 'dialogue-box-portrait' : 'dialogue-box-landscape'
})

// Import our quality selection composable
const { useUpscaledImages, getQualityAssetPath } = useQualitySelection()

// Computed properties for image and video paths
const backgroundImagePath = computed(() => {
  const normalPath = isPortrait.value 
    ? '/assets/9-16/normal_images/boy_standing.jpg' 
    : '/assets/16-9/normal_images/boy_standing.jpg'
  const upscaledPath = isPortrait.value 
    ? '/assets/9-16/upscaled_images/boy_standing.png' 
    : '/assets/16-9/upscaled_images/boy_standing.png'
  return getQualityAssetPath(normalPath, upscaledPath)
})

const backgroundVideoPath = computed(() => {
  // Videos don't change based on quality selection for this page
  return isPortrait.value 
    ? '/assets/9-16/videos/boy_standing.mp4' 
    : '/assets/16-9/videos/boy_standing1.mp4'
})
</script>

<template>
  <!-- Update the template to use the computed properties -->
  <div 
    class="main-container" 
    :class="{ 'fade-out': isFadingOut }"
    @click="goToNextStep"
  >
    <!-- Background image or video -->
    <div class="background-image">
      <!-- Static image shown initially -->
      <img 
        v-if="!showVideo"
        :src="backgroundImagePath" 
        :class="isPortrait ? 'portrait-image' : 'landscape-image'"
        alt="Boy standing"
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

/* Landscape positioning */
.dialogue-box-landscape {
  left: 5%;
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
  min-height: 5.1rem; /* Space for 2 lines */
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