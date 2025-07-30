<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// Track current state
const isTyping = ref(false)
const typedText = ref('')
const showTapPrompt = ref(false)
const tapPromptOpacity = ref(0)
const isPortrait = ref(false)
const isFadingOut = ref(false)
const isFadingIn = ref(true)
const showQuestion = ref(false)
const rejectionCount = ref(0)
const showRejectionMessage = ref(false)
const rejectionMessage = ref('')

// Video state variables - simplified from main.vue approach
const showFirstVideo = ref(false)
const showSecondVideo = ref(false)
const showBackgroundImage = ref(true)

// Audio elements for voice narration
const firstLineAudio = ref(null)
const secondLineAudio = ref(null)
const isFirstAudioPlaying = ref(false)
const isSecondAudioPlaying = ref(false)

// Animation timing constants (from main.vue)
const TYPING_SPEED = 50 // ms per character
const PAUSE_BETWEEN_LINES = 1500 // ms
const VIDEO_START_BEFORE_END = 5000 // ms
const FADE_TRANSITION_TIME = 1000 // ms

// Store intervals for cleanup
let typewriterInterval = null

// Text content for typewriter effect
const dialogueLines = [
  "Did you feel it...? A gentle warmth brushing your soul?",
  "That's me… arriving in your heart."
]

// Rejection messages
const rejectionMessages = [
  "Please accept my love... I have flown through long ways to reach you.",
  "Give me a chance, my heart has traveled miles just for you.",
  "This is my final plea... if you reject me now, you will never meet me again."
]

// Current line being typed
const currentLine = ref(0)

// Check device orientation
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  
  // Initialize audio elements
  firstLineAudio.value = new Audio('/assets/voice/Did you feel it.wav')
  secondLineAudio.value = new Audio('/assets/voice/That\'s me… arriving in your heart.wav')
  
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
    // If this is the last line, show question
    if (currentLine.value === dialogueLines.length - 1) {
      isTyping.value = false
      showQuestion.value = true
    }
  })
  
  // Start fade in effect
  setTimeout(() => {
    isFadingIn.value = false
    // Start typing after fade in completes
    setTimeout(() => {
      startTypewriter()
    }, 500)
  }, 500)
  
  // Set up video end event listeners
  setupVideoEventListeners()
})

// Clean up event listeners and intervals when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation)
  
  // Clear any running intervals
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

function setupVideoEventListeners() {
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    const secondVideo = document.querySelector('.second-video')
    
    // Set up event listener for the second video
    if (secondVideo) {
      console.log('Second video element found, setting up onended event')
      secondVideo.onended = () => {
        console.log('Second video ended, starting fade transition to final page')
        // When second video ends, fade out and navigate to final page
        isFadingOut.value = true
        
        // After fade out completes, navigate to final page
        setTimeout(() => {
          console.log('Fade out complete, navigating to final page')
          navigateTo('/final')
        }, FADE_TRANSITION_TIME)
      }
    } else {
      console.warn('Second video element not found yet, will retry')
      // If video element not found, try again after a short delay
      setTimeout(setupVideoEventListeners, 1000)
    }
    
    // Set up a safety timeout in case the video's onended event doesn't fire
    if (showSecondVideo.value) {
      setTimeout(() => {
        if (!isFadingOut.value) {
          console.log('Safety timeout: starting fade transition to final page')
          isFadingOut.value = true
          
          // After fade out completes, navigate to final page
          setTimeout(() => {
            console.log('Fade out complete, navigating to final page')
            navigateTo('/final')
          }, FADE_TRANSITION_TIME)
        }
      }, 15000) // Adjust timeout based on your video length
    }
  }, 500)
}

// Function to play video - simplified from main.vue
function playVideo(selector) {
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    const videoElement = document.querySelector(selector)
    if (videoElement) {
      videoElement.play()
        .catch(error => {
          console.error(`Error playing video ${selector}:`, error)
        })
    }
  }, 100)
}

// Watch for video state changes to ensure videos play
watch(showFirstVideo, (newValue) => {
  if (newValue) {
    playVideo('.first-video')
  }
})

watch(showSecondVideo, (newValue) => {
  if (newValue) {
    playVideo('.second-video')
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

// Typewriter effect function - adapted from main.vue
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
  
  // Video playback timing calculation:
  // If total animation time > VIDEO_START_BEFORE_END:
  //   - Start video VIDEO_START_BEFORE_END ms before animation ends
  // If total animation time <= VIDEO_START_BEFORE_END:
  //   - Start video immediately
  const videoStartDelay = totalTypingTime > VIDEO_START_BEFORE_END ? 
    totalTypingTime - VIDEO_START_BEFORE_END : 0
  
  // If total time is less than VIDEO_START_BEFORE_END, show video immediately
  if (totalTypingTime <= VIDEO_START_BEFORE_END) {
    setTimeout(() => {
      showBackgroundImage.value = false
      showFirstVideo.value = true
    }, 100)
  } else {
    // Otherwise, set a timer to show the video before animation ends
    setTimeout(() => {
      showBackgroundImage.value = false
      showFirstVideo.value = true
    }, videoStartDelay)
  }
  
  // If we've reached the end of all dialogue lines
  if (currentLine.value >= dialogueLines.length) {
    isTyping.value = false
    // Show question immediately after typing ends
    showQuestion.value = true
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
      // For the second line, we'll also let the audio ended event handle showing the question
      
      // If audio is not playing (maybe it failed to play), fall back to the original behavior
      if (currentLine.value === 0 && !isFirstAudioPlaying.value) {
        // More lines to go - pause then continue to next line
        setTimeout(() => {
          currentLine.value++
          typedText.value = ''
          startTypewriter()
        }, PAUSE_BETWEEN_LINES)
      } else if (currentLine.value === 1 && !isSecondAudioPlaying.value) {
        // This was the last line
        isTyping.value = false
        // Show question immediately after typing ends
        showQuestion.value = true
      }
    }
  }, TYPING_SPEED)
}

// Function to handle "Yes" button click
function handleYesClick() {
  console.log('Yes button clicked')
  // First hide the question with a fade effect
  showQuestion.value = false
  
  // Start the full page fade out
  isFadingOut.value = true
  console.log('Starting full page fade out')
  
  // After the full page fade out completes, prepare for the second video
  setTimeout(() => {
    // Hide first video, background image, and dialogue box
    showBackgroundImage.value = false
    showFirstVideo.value = false
    
    // Hide the dialogue box by setting its display to none
    const dialogueBox = document.querySelector('.glass-dialogue')
    if (dialogueBox) {
      dialogueBox.style.display = 'none'
      console.log('Hiding dialogue box')
    }
    
    // Prepare to show second video
    showSecondVideo.value = true
    
    // Start fade in with second video
    isFadingOut.value = false
    isFadingIn.value = true
    console.log('Preparing second video and starting fade in')
    
    // Ensure video event listeners are set up for the second video
    setupVideoEventListeners()
    
    // Complete the fade in and play the second video
    setTimeout(() => {
      isFadingIn.value = false
      console.log('Fade in complete, playing second video')
      
      // Force play the second video
      setTimeout(() => {
        const secondVideo = document.querySelector('.second-video')
        if (secondVideo) {
          console.log('Playing second video')
          secondVideo.play()
            .then(() => console.log('Second video playback started'))
            .catch(error => console.error('Error playing second video:', error))
        } else {
          console.error('Second video element not found')
        }
      }, 100)
    }, FADE_TRANSITION_TIME)
  }, FADE_TRANSITION_TIME)
}

// Function to handle "No" button click
function handleNoClick() {
  // Show rejection message
  showQuestion.value = false
  showRejectionMessage.value = true
  rejectionMessage.value = rejectionMessages[rejectionCount.value]
  
  // Increment rejection count
  rejectionCount.value++
  
  // If user has rejected 3 times, restart the scene on next rejection
  if (rejectionCount.value >= 3) {
    setTimeout(() => {
      showRejectionMessage.value = false
      isFadingOut.value = true
      
      setTimeout(() => {
        // Reset all states and restart
        rejectionCount.value = 0
        currentLine.value = 0
        typedText.value = ''
        showQuestion.value = false
        showRejectionMessage.value = false
        isFadingOut.value = false
        isFadingIn.value = true
        showFirstVideo.value = false
        showSecondVideo.value = false
        showBackgroundImage.value = true
        
        // Restart the scene
        setTimeout(() => {
          isFadingIn.value = false
          setTimeout(() => {
            startTypewriter()
          }, 500)
        }, 500)
      }, FADE_TRANSITION_TIME)
    }, 3000)
  } else {
    // After showing rejection message, show question again
    setTimeout(() => {
      showRejectionMessage.value = false
      showQuestion.value = true
    }, 3000)
  }
}

// Computed class for dialogue box position
const dialogueBoxClass = computed(() => {
  return isPortrait.value ? 'dialogue-box-portrait' : 'dialogue-box-landscape'
})
</script>

<template>
  <div 
    class="main-container" 
    :class="{ 'fade-out': isFadingOut, 'fade-in': isFadingIn }"
  >
    <!-- Background image or videos -->
    <div class="background-image">
      <!-- First video: girl_asking -->
      <video 
        v-if="showFirstVideo"
        :src="isPortrait ? '/assets/9-16/videos/girl_asking.mp4' : '/assets/16-9/videos/girl_asking.mp4'" 
        :class="[isPortrait ? 'portrait-image' : 'landscape-image', 'first-video']"
        muted
        playsinline
      ></video>
      
      <!-- Second video: girl_catching_love -->
      <video 
        v-if="showSecondVideo"
        :src="isPortrait ? '/assets/9-16/videos/girl_catching_love.mp4' : '/assets/16-9/videos/girl_catching_love.mp4'" 
        :class="[isPortrait ? 'portrait-image' : 'landscape-image', 'second-video']"
        muted
        playsinline
      ></video>
      
      <!-- Background image when no video is playing -->
      <img 
        v-if="showBackgroundImage"
        :src="isPortrait ? '/assets/9-16/normal_images/girl_catching_love.jpg' : '/assets/16-9/normal_images/girl_catching_love.jpg'" 
        :class="isPortrait ? 'portrait-image' : 'landscape-image'"
        alt="Girl catching love"
      />
    </div>
    
    <!-- Glass dialogue box -->
    <div :class="['glass-dialogue', dialogueBoxClass]">
      <div class="dialogue-content">
        <p class="typed-text">{{ typedText }}<span class="cursor" v-if="isTyping">|</span></p>
        
        <!-- Accept question with buttons -->
        <div v-if="showQuestion" class="question-container">
          <p class="question-text">Do you accept it?</p>
          <div class="button-container">
            <button class="glass-button yes-button" @click="handleYesClick">Yes</button>
            <button class="glass-button no-button" @click="handleNoClick">No</button>
          </div>
        </div>
        
        <!-- Rejection message -->
        <p v-if="showRejectionMessage" class="rejection-message">
          {{ rejectionMessage }}
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
  transition: opacity 1s ease;
}

.fade-out {
  opacity: 0;
  transition: opacity 1s ease;
}

.fade-in {
  opacity: 0;
  transition: opacity 1s ease;
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
  transition: all 0.5s ease, opacity 1s ease;
  overflow: hidden;
  opacity: 1; /* Start fully visible */
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

/* Landscape positioning - left side for fourth page */
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
  min-height: 6rem; /* Space for text */
  margin-bottom: 25px;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.cursor {
  animation: blink 1s infinite;
}

/* Question and buttons styling */
.question-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s forwards;
}

.question-text {
  font-size: 1.4rem;
  font-weight: 400;
  margin-bottom: 20px;
  text-align: center;
}

.button-container {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.glass-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  color: white;
  padding: 12px 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

.yes-button {
  background: rgba(144, 238, 144, 0.15);
  border: 1px solid rgba(144, 238, 144, 0.3);
}

.yes-button:hover {
  background: rgba(144, 238, 144, 0.25);
}

.no-button {
  background: rgba(255, 105, 97, 0.15);
  border: 1px solid rgba(255, 105, 97, 0.3);
}

.no-button:hover {
  background: rgba(255, 105, 97, 0.25);
}

/* Rejection message styling */
.rejection-message {
  font-size: 1.3rem;
  line-height: 1.6;
  text-align: center;
  margin: 20px 0;
  animation: fadeIn 0.5s forwards;
  font-weight: 400;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Media queries for different screen sizes */
@media (max-width: 768px) {
  .typed-text {
    font-size: 1.3rem;
    min-height: 4.5rem;
  }
  
  .question-text {
    font-size: 1.2rem;
  }
  
  .glass-button {
    padding: 10px 25px;
    font-size: 1rem;
  }
  
  .rejection-message {
    font-size: 1.1rem;
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
  
  .question-text {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  .glass-button {
    padding: 8px 20px;
    font-size: 0.9rem;
  }
  
  .button-container {
    gap: 15px;
  }
  
  .rejection-message {
    font-size: 1rem;
  }
}
</style>