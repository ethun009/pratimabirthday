<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Candle from '~/components/Candle.vue'

// Track current state
const isPortrait = ref(false)
const isFadingIn = ref(true)
const showBird = ref(false)
const showLetter = ref(false)
const letterOpened = ref(false)
const showConfetti = ref(false)
const candlesBlown = ref(false)
const showBirthdayText = ref(false)
const showSurpriseEffect = ref(false)
const candles = ref([false, false, false, false, false])
const allCandlesBlown = ref(false)
const pageBlurLevel = ref(0) // Use a number for gradual blur
const showClickMe = ref(false)
const typedText = ref('')
const typingComplete = ref(false)
const showMemoriesText = ref(false)
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const showInstructionDialog = ref(true) // Show dialog on page load
const letterAudio = ref(null)
const loveResponseAudio = ref(null) // New audio for love response
const isAudioPlaying = ref(false)

// Letter content for typewriter effect
const letterContent = "Dear Pratima,\nEven though it's been just a few days, but every message, every smile you share is precious.\nOn your birthday, I wish I could be there — but till we meet, I made this little website for you.\nAnd today, I want to ask you something straight from my heart:\n<span style=\"color: red;\">I love You</span> <span style=\"color: lightblue;\">Will you be mine?</span>\nIf your answer is yes, then just write \"<span style=\"color: red;\">I love you too</span>\" and send it to me."
const signature = "Yours lovely,\nEthun."

// Reply handling
const userReply = ref('')
const showReplyInput = ref(false)
const replySubmitted = ref(false)
const showLoveResponse = ref(false)
const attemptCount = ref(0)
const maxAttempts = 3
const birdFlyingAway = ref(false)
const letterClosing = ref(false)
const blurTransitioning = ref(false) // Track blur transition state
const birdVisible = ref(false) // Track if bird is already visible

// Check device orientation
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  
  // Start fade in effect
  setTimeout(() => {
    isFadingIn.value = false
  }, 500)
  
  // Initialize audio elements
  letterAudio.value = new Audio('/assets/voice/letter.wav')
  loveResponseAudio.value = new Audio('/assets/voice/I knew you also love me.wav')
  
  // Add event listener for audio completion
  letterAudio.value.addEventListener('ended', () => {
    isAudioPlaying.value = false
  })
  
  // Add event listeners for drag/swipe
  const candlesContainer = document.querySelector('.candles-container')
  if (candlesContainer) {
    // Mouse events for desktop
    candlesContainer.addEventListener('mousedown', handleDragStart)
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    
    // Touch events for mobile
    candlesContainer.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
  }
  
  // Prevent text selection during drag
  document.body.classList.add('no-select')
})

// Clean up event listeners on unmount
onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation)
  
  // Remove drag/swipe event listeners
  const candlesContainer = document.querySelector('.candles-container')
  if (candlesContainer) {
    // Mouse events
    candlesContainer.removeEventListener('mousedown', handleDragStart)
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragEnd)
    
    // Touch events
    candlesContainer.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  }
  
  // Clean up audio resources
  if (letterAudio.value) {
    letterAudio.value.pause()
    letterAudio.value.removeEventListener('ended', () => {})
  }
  
  if (loveResponseAudio.value) {
    loveResponseAudio.value.pause()
  }
  
  // Remove no-select class
  document.body.classList.remove('no-select')
})

function checkOrientation() {
  isPortrait.value = window.innerHeight > window.innerWidth
}

// Toggle instruction dialog
function toggleInstructionDialog() {
  showInstructionDialog.value = !showInstructionDialog.value
}

// Close instruction dialog
function closeInstructionDialog() {
  showInstructionDialog.value = false
}

// Handle drag start
function handleDragStart(e) {
  if (candlesBlown.value) return
  
  isDragging.value = true
  dragStartPos.value = {
    x: e.clientX || 0,
    y: e.clientY || 0
  }
  
  // Prevent default to avoid text selection
  e.preventDefault()
}

// Handle drag move
function handleDragMove(e) {
  if (!isDragging.value || candlesBlown.value) return
  
  const currentPos = {
    x: e.clientX || 0,
    y: e.clientY || 0
  }
  
  // Check if mouse is over any candle
  const candleElements = document.querySelectorAll('.candle-wrapper')
  candleElements.forEach((candleEl, index) => {
    const rect = candleEl.getBoundingClientRect()
    if (
      currentPos.x >= rect.left && 
      currentPos.x <= rect.right && 
      currentPos.y >= rect.top && 
      currentPos.y <= rect.bottom
    ) {
      // Blow this candle
      if (!candles.value[index]) {
        const candleComponent = candleEl.querySelector('.candle')
        if (candleComponent) {
          candleComponent.click()
        }
      }
    }
  })
}

// Handle drag end
function handleDragEnd() {
  isDragging.value = false
}

// Handle touch start (mobile)
function handleTouchStart(e) {
  if (candlesBlown.value) return
  
  isDragging.value = true
  if (e.touches && e.touches[0]) {
    dragStartPos.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }
}

// Handle touch move (mobile)
function handleTouchMove(e) {
  if (!isDragging.value || candlesBlown.value) return
  
  if (e.touches && e.touches[0]) {
    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    
    // Check if touch is over any candle
    const candleElements = document.querySelectorAll('.candle-wrapper')
    candleElements.forEach((candleEl, index) => {
      const rect = candleEl.getBoundingClientRect()
      if (
        currentPos.x >= rect.left && 
        currentPos.x <= rect.right && 
        currentPos.y >= rect.top && 
        currentPos.y <= rect.bottom
      ) {
        // Blow this candle
        if (!candles.value[index]) {
          const candleComponent = candleEl.querySelector('.candle')
          if (candleComponent) {
            candleComponent.click()
          }
        }
      }
    })
  }
}

// Handle touch end (mobile)
function handleTouchEnd() {
  isDragging.value = false
  
  // Check if all candles are blown
  if (candles.value.every(candle => candle)) {
    blowCandles()
  }
}

// Handle blowing candles
function blowCandles() {
  if (candlesBlown.value) return
  
  candlesBlown.value = true
  allCandlesBlown.value = true
  
  // Show confetti after candles are blown
  setTimeout(() => {
    showConfetti.value = true
    
    // Show birthday text after confetti appears
    setTimeout(() => {
      showBirthdayText.value = true
      
      // Show surprise effect after text appears
      setTimeout(() => {
        showSurpriseEffect.value = true
        
        // Show bird after surprise effect and text animation + 2 seconds delay
        setTimeout(() => {
          showBird.value = true
          
          // Start gradual blur as bird flies in
          startGradualBlur();
          
          // Show click me animation after bird appears and centers
          setTimeout(() => {
            showClickMe.value = true
          }, 3000)
        }, 4000)
      }, 1500)
    }, 1000)
  }, 500)
}

// Handle individual candle blown
function handleCandleBlown(index) {
  candles.value[index] = true
  
  // Check if all candles are blown
  if (candles.value.every(candle => candle)) {
    blowCandles()
  }
}

// Gradually increase blur over time as bird flies in
function startGradualBlur() {
  let blurStep = 0;
  const maxBlur = 8;
  const interval = 100; // Update every 100ms
  const duration = 3000; // Complete in 3 seconds (matching bird animation)
  const steps = duration / interval;
  const blurIncrement = maxBlur / steps;
  
  const blurInterval = setInterval(() => {
    blurStep += 1;
    pageBlurLevel.value = blurStep * blurIncrement;
    
    if (blurStep >= steps) {
      clearInterval(blurInterval);
      birdVisible.value = true; // Mark bird as visible when blur is complete
    }
  }, interval);
}

// Handle bird click
function handleBirdClick() {
  if (!showBird.value || showLetter.value) return
  
  birdVisible.value = true // Mark bird as visible/centered
  showBird.value = false // Hide bird animation
  showLetter.value = true // Show letter
  
  // Start typewriter effect
  startTypewriter()
}

// Typewriter effect for letter
function startTypewriter() {
  let i = 0;
  const speed = 50; // Typing speed in ms
  const fullText = letterContent + "\n\n" + signature;
  
  // Get the background music plugin
  const { $bgMusic } = useNuxtApp()
  
  // Play the letter audio
  if (letterAudio.value) {
    // Decrease background music volume before playing audio
    $bgMusic.decreaseVolume()
    
    isAudioPlaying.value = true
    letterAudio.value.play().catch(error => {
      console.error('Error playing letter audio:', error)
      isAudioPlaying.value = false
      // Restore volume if audio fails to play
      $bgMusic.restoreVolume()
    })
    
    // Add event listener to restore volume when audio ends
    letterAudio.value.addEventListener('ended', () => {
      $bgMusic.restoreVolume()
    }, { once: true })
  }
  
  const typeInterval = setInterval(() => {
    if (i < fullText.length) {
      typedText.value += fullText.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
      typingComplete.value = true;
      
      // Show reply input after typing is complete
      // If audio is still playing, wait for it to finish
      if (!isAudioPlaying.value) {
        setTimeout(() => {
          showReplyInput.value = true
        }, 1000)
      } else {
        // Set up a listener to show reply input after audio ends
        letterAudio.value.addEventListener('ended', () => {
          setTimeout(() => {
            showReplyInput.value = true
          }, 1000)
        }, { once: true })
      }
    }
  }, speed);
}

// Handle letter click
function handleLetterClick() {
  if (!showLetter.value || letterOpened.value) return
  
  letterOpened.value = true
}

// Handle tap to continue
function handleTapToContinue() {
  if (!typingComplete.value || !showMemoriesText.value) return;
  
  // Navigate to memories page
  window.location.href = '/memories';
}

// Generate random confetti styles
function getConfettiStyle(index) {
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#ff9baa'];
  const size = Math.floor(Math.random() * 10) + 5; // 5px to 15px
  const color = colors[index % colors.length];
  const left = Math.random() * 100; // 0% to 100%
  const animationDuration = Math.random() * 4 + 2; // 2s to 6s
  const animationDelay = Math.random() * 5; // 0s to 5s
  
  return {
    backgroundColor: color,
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${animationDelay}s`
  };
}

// Function to handle reply submission
function handleReplySubmit() {
  replySubmitted.value = true
  
  // Check if reply contains "i love you too" (case insensitive)
  if (userReply.value.toLowerCase().includes('i love you too')) {
    // Show love response after a short delay
    setTimeout(() => {
      showLoveResponse.value = true
      
      // Get the background music plugin
      const { $bgMusic } = useNuxtApp()
      
      // Play the love response audio
      if (loveResponseAudio.value) {
        // Decrease background music volume before playing audio
        $bgMusic.decreaseVolume()
        
        loveResponseAudio.value.play().catch(error => {
          console.error('Error playing love response audio:', error)
          // Restore volume if audio fails to play
          $bgMusic.restoreVolume()
        })
        
        // Add event listener to restore volume when audio ends
        loveResponseAudio.value.addEventListener('ended', () => {
          $bgMusic.restoreVolume()
        }, { once: true })
      }
      
      // Show memories text after response
      setTimeout(() => {
        showMemoriesText.value = true
      }, 2000)
    }, 1000)
  } else {
    // Increment attempt count
    attemptCount.value++
    
    if (attemptCount.value >= maxAttempts) {
      // After 3 failed attempts, start closing animation sequence
      letterClosing.value = true
      
      // Hide letter after animation completes
      setTimeout(() => {
        showLetter.value = false
        
        // Make bird fly away without resetting position
        setTimeout(() => {
          birdFlyingAway.value = true
          blurTransitioning.value = true // Start blur transition
          
          // Gradually decrease blur over time
          startGradualBlurDecrease()
        }, 500)
      }, 2000)
    } else {
      // Allow another attempt after showing current reply for a moment
      setTimeout(() => {
        replySubmitted.value = false
      }, 2000)
    }
  }
}

// Gradually decrease blur over time as bird flies away
function startGradualBlurDecrease() {
  let blurStep = pageBlurLevel.value;
  const interval = 100; // Update every 100ms
  const duration = 2000; // Complete in 2 seconds (matching bird animation)
  const steps = duration / interval;
  const blurDecrement = blurStep / steps;
  
  const blurInterval = setInterval(() => {
    blurStep -= blurDecrement;
    pageBlurLevel.value = Math.max(0, blurStep);
    
    if (blurStep <= 0) {
      clearInterval(blurInterval);
      blurTransitioning.value = false;
    }
  }, interval);
}
</script>

<template>
  <div 
    class="main-container" 
    :class="{ 'fade-in': isFadingIn }"
    :style="{ filter: blurTransitioning ? `blur(${pageBlurLevel}px)` : (birdFlyingAway ? 'blur(0px)' : `blur(${pageBlurLevel}px)`) }"
  >
    <!-- Background with gradient -->
    <div class="background-gradient"></div>
    
    <!-- Balloons using images - added more balloons -->
    <div class="balloons-container">
      <div class="balloon balloon1">
        <img src="/assets/balloons.png" alt="Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon2">
        <img src="/assets/heartballoon.png" alt="Heart Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon3">
        <img src="/assets/balloons.png" alt="Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon4">
        <img src="/assets/heartballoon.png" alt="Heart Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon5">
        <img src="/assets/balloons.png" alt="Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon6">
        <img src="/assets/heartballoon.png" alt="Heart Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon7">
        <img src="/assets/balloons.png" alt="Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon8">
        <img src="/assets/heartballoon.png" alt="Heart Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon9">
        <img src="/assets/balloons.png" alt="Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon10">
        <img src="/assets/heartballoon.png" alt="Heart Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon11">
        <img src="/assets/balloons.png" alt="Balloons" class="balloon-img" />
      </div>
      <div class="balloon balloon12">
        <img src="/assets/heartballoon.png" alt="Heart Balloons" class="balloon-img" />
      </div>
    </div>
    
    <!-- Birthday cake section -->
    <div class="cake-container">
      <!-- Cake setup with table -->
      <div class="cake-table-setup">
        <!-- Table image as background -->
        <img src="/assets/table.png" alt="Table" class="table-image" />
        
        <!-- Cake image on top of table -->
        <img src="/assets/cake.png" alt="Birthday Cake" class="cake-image" />
        
        <!-- Candles positioned on top of cake -->
        <div class="candles-container">
          <div class="candle-wrapper candle1">
            <Candle :blown="candles[0]" @blown="handleCandleBlown(0)" />
          </div>
          <div class="candle-wrapper candle2">
            <Candle :blown="candles[1]" @blown="handleCandleBlown(1)" />
          </div>
          <div class="candle-wrapper candle3">
            <Candle :blown="candles[2]" @blown="handleCandleBlown(2)" />
          </div>
          <div class="candle-wrapper candle4">
            <Candle :blown="candles[3]" @blown="handleCandleBlown(3)" />
          </div>
          <div class="candle-wrapper candle5">
            <Candle :blown="candles[4]" @blown="handleCandleBlown(4)" />
          </div>
        </div>
      </div>
      
      <!-- Birthday text animation with two lines -->
      <div v-if="showBirthdayText" class="birthday-text-container">
        <!-- First line: Happy Birthday -->
        <div class="birthday-text-line">
          <div class="birthday-letter" v-for="(letter, index) in 'Happy Birthday'" :key="'line1-'+index" :style="`--delay: ${0.1 * (index + 1)}s`">
            {{ letter === ' ' ? '\u00A0' : letter }}
          </div>
        </div>
        
        <!-- Second line: Pratima!! -->
        <div class="birthday-text-line">
          <div class="birthday-letter" v-for="(letter, index) in 'Pratima!!'" :key="'line2-'+index" :style="`--delay: ${0.1 * (index + 1 + 'Happy Birthday'.length)}s`">
            {{ letter === ' ' ? '\u00A0' : letter }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Surprise effect -->
    <div v-if="showSurpriseEffect" class="surprise-container">
      <div class="gift-box gift-box1">🎁</div>
      <div class="gift-box gift-box2">🎁</div>
      <div class="gift-box gift-box3">🎁</div>
      <div class="heart-burst">❤️</div>
    </div>
    
    <!-- Enhanced confetti animation - only shown after blowing candles -->
    <div v-if="showConfetti" class="confetti-container">
      <div v-for="n in 50" :key="n" class="confetti-piece" :style="getConfettiStyle(n)"></div>
    </div>
    
    <!-- Help button in corner -->
    <button class="help-button" @click="toggleInstructionDialog">
      <span>?</span>
    </button>
  </div>
  
  <!-- Bird animation - updated with envelope in mouth -->
  <div 
    v-if="showBird || birdFlyingAway" 
    class="bird-container"
    :class="{ 'fly-away-animation': birdFlyingAway, 'bird-centered': birdVisible }"
    @click="birdFlyingAway ? null : handleBirdClick()"
  >
    <div class="bird">
      <img src="/assets/dove.gif" alt="Bird" class="bird-img" />
      <div class="envelope-in-mouth">
        <img src="/assets/letter-envelope.png" alt="Envelope" class="envelope-img" />
      </div>
      <div v-if="showClickMe && !birdFlyingAway" class="click-me">Click me!</div>
    </div>
  </div>
  
  <!-- New letter with typewriter animation -->
  <div 
    v-if="showLetter" 
    class="new-letter-container"
    :class="{ 'clickable': showMemoriesText }"
    @click="showMemoriesText ? handleTapToContinue() : null"
  >
    <div class="notebook-paper" :class="{ 'fly-away': birdFlyingAway, 'letter-closing': letterClosing }">
      <div class="notebook-header">
        <div class="red-margin"></div>
      </div>
      <div class="notebook-content">
        <div class="typewriter-text" v-html="typedText.replace(/\n/g, '<br>')"></div>
        
        <!-- Reply input section -->
        <div v-if="showReplyInput && !replySubmitted" class="reply-section">
          <div class="type-your-reply">Type your reply:</div>
          <div class="reply-input-container">
            <input 
              type="text" 
              v-model="userReply" 
              class="reply-input" 
              placeholder="Type here..."
              @keyup.enter="handleReplySubmit"
            />
            <div class="cursor-blink"></div>
          </div>
          <button class="send-button" @click="handleReplySubmit">Send</button>
        </div>
        
        <!-- Conversation display -->
        <div v-if="replySubmitted" class="conversation-container">
          <!-- User's reply display -->
          <div class="conversation-message user-message">
            <div class="message-sender">Your reply:</div>
            <div class="message-content">{{ userReply }}</div>
          </div>
          
          <!-- Love response message -->
          <div v-if="showLoveResponse" class="conversation-message response-message">
            <div class="message-sender">Ethun:</div>
            <div class="message-content">I knew you also love me.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Instruction dialog -->
  <div v-if="showInstructionDialog" class="instruction-dialog-overlay" @click="closeInstructionDialog">
    <div class="instruction-dialog" @click.stop>
      <div class="instruction-dialog-header">
        <h2>How to Blow the Candles</h2>
        <button class="close-button" @click="closeInstructionDialog">×</button>
      </div>
      <div class="instruction-dialog-content">
        <p><strong>On Desktop:</strong> Click and drag your mouse over the candles to blow them out.</p>
        <p><strong>On Mobile:</strong> Swipe your finger across the candles to blow them out.</p>
        <p><strong>Or:</strong> Simply tap/click on each candle individually.</p>
        <p>Blow all five candles to see the birthday surprise!</p>
      </div>
      <div class="instruction-dialog-footer">
        <button class="got-it-button" @click="closeInstructionDialog">Got it!</button>
      </div>
    </div>
  </div>

  <!-- Add memories text to main container -->
  <div 
    v-if="showMemoriesText" 
    class="memories-text-bottom"
    @click="handleTapToContinue()"
  >
    Tap to see memories
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

/* Prevent text selection */
:global(.no-select) {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
}

.main-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  transition: opacity 1s ease, filter 0.1s linear;
  color: white;
}

.fade-in {
  opacity: 0;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  z-index: 1;
}

/* Cake styling */
.cake-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  text-align: center;
  width: 90%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Cake and table setup */
.cake-table-setup {
  position: relative;
  width: 600px;
  height: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Table styling */
.table-image {
  position: absolute;
  top: 110%; /* Move table higher */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: auto;
  z-index: 5;
}

/* Cake styling */
.cake-image {
  position: absolute;
  top: 60%; /* Position cake lower on the table */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%; /* Make cake slightly smaller */
  height: auto;
  z-index: 6;
}

.candles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 7; /* Above cake */
  cursor: pointer;
}

.candle-wrapper {
  position: absolute;
  transform: scale(0.4);
  cursor: pointer;
  pointer-events: auto;
}

.candle1 {
         top: 20%;
  left: 39%;
}

.candle2 {
         top: 20%;
  left: 43%;
}

.candle3 {
         top: 20%;
  left: 47%;
}

.candle4 {
        top: 20%;
  left: 51%;
}

.candle5 {
         top: 20%;
  left: 55%;
}

/* Birthday text animation - updated for two lines */
.birthday-text-container {
  position: absolute;
  top: -10%;
  left: 0;
  width: 100%;
  z-index: 15;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.birthday-text-line {
  display: flex;
  justify-content: center;
  flex-wrap: wrap; /* Allow text to wrap on smaller screens */
  max-width: 90%; /* Prevent text from extending beyond screen edges */
}

.birthday-letter {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: scale(0);
  animation: letterPop 0.6s forwards;
  animation-delay: var(--delay);
  margin: 0 2px;
}

@keyframes letterPop {
  0% {
    opacity: 0;
    transform: scale(0) translateY(30px);
  }
  70% {
    opacity: 1;
    transform: scale(1.2) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Balloons using images */
.balloons-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.balloon {
  position: absolute;
  animation: float 10s ease-in-out infinite;
}

.balloon-img {
  width: 120px;
  height: auto;
}

.balloon1 { left: 5%; top: 10%; animation-delay: 0s; }
.balloon2 { left: 80%; top: 15%; animation-delay: 2s; }
.balloon3 { left: 15%; top: 70%; animation-delay: 4s; }
.balloon4 { left: 70%; top: 75%; animation-delay: 1s; }
.balloon5 { left: 85%; top: 40%; animation-delay: 3s; }
.balloon6 { left: 25%; top: 45%; animation-delay: 5s; }
.balloon7 { left: 40%; top: 5%; animation-delay: 2.5s; }
.balloon8 { left: 60%; top: 65%; animation-delay: 3.5s; }
.balloon9 { left: 10%; top: 30%; animation-delay: 4.5s; }
.balloon10 { left: 90%; top: 55%; animation-delay: 1.5s; }
.balloon11 { left: 30%; top: 85%; animation-delay: 0.5s; }
.balloon12 { left: 75%; top: 25%; animation-delay: 2.8s; }

/* Surprise effect */
.surprise-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.gift-box {
  position: absolute;
  font-size: 3rem;
  opacity: 0;
  animation: popAndFade 2s forwards;
}

.gift-box1 { left: 30%; top: 40%; animation-delay: 0.2s; }
.gift-box2 { left: 60%; top: 30%; animation-delay: 0.7s; }
.gift-box3 { left: 45%; top: 60%; animation-delay: 1.2s; }

.heart-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0;
  animation: heartBurst 1.5s forwards;
}

/* Bird animation - updated with envelope in mouth */
.bird-container {
  position: fixed;
  top: 50%;
  left: -150px;
  transform: translateY(-50%);
  z-index: 100; /* Higher than the blurred content */
  animation: flyAcrossScreen 6s ease forwards;
  cursor: pointer;
}

/* Bird centered in screen position */
.bird-centered {
  animation: none;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
}

.bird {
  position: relative;
  width: 180px;
  height: 180px;
  transform: scale(1.5);
}

.bird-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.envelope-in-mouth {
  position: absolute;
  top: 45%;
  left: 60%;
  width: 40px;
  height: 30px;
  transform: rotate(15deg);
  z-index: 5;
}

.envelope-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.click-me {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: #ff6b6b;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  animation: pulseGrow 1s infinite alternate;
  opacity: 0;
  animation-fill-mode: forwards;
}

/* New letter with typewriter effect - Notebook style */
.new-letter-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s forwards;
  background-color: rgba(0, 0, 0, 0.8);
}

.notebook-paper {
  width: 85%;
  max-width: 600px;
  height: 75vh;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
  position: relative;
  overflow: hidden;
  transform-origin: center;
  animation: fromBird 1s forwards;
  display: flex;
}

.notebook-header {
  width: 40px;
  height: 100%;
  background-color: #f8f8f8;
  border-right: 1px solid #e0e0e0;
}

.red-margin {
  position: absolute;
  left: 30px;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: #ff6b6b;
}

.notebook-content {
  flex: 1;
  padding: 30px 40px 30px 50px;
  position: relative;
  overflow-y: auto;
  background-image: 
    linear-gradient(#e1e1e1 1px, transparent 1px);
  background-size: 100% 28px;
  background-position: 0 27px;
}

.typewriter-text {
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem;
  color: #333;
  line-height: 28px; /* Match the background lines */
  white-space: pre-wrap;
  position: relative;
  top: -5px; /* Position text slightly above the lines */
}

.memories-text-bottom {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Dancing Script', cursive;
  font-size: 2rem;
  color: #ff6b6b;
  text-align: center;
  width: 100%;
  text-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
  animation: fadeInOut 2s infinite;
  z-index: 120;
  cursor: pointer;
}

/* Enhanced confetti animation */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 10px;
  background-color: #f94144;
  border-radius: 50%;
  animation: confettiFall linear infinite;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes flyAcrossScreen {
  0% {
    left: -150px;
    transform: translateY(-50%) scale(0.5);
  }
  30% {
    left: 30%;
    transform: translateY(-70%) scale(0.8) rotate(-10deg);
  }
  50% {
    left: 60%;
    transform: translateY(-30%) scale(0.9) rotate(10deg);
  }
  70% {
    left: 40%;
    transform: translateY(-60%) scale(1) rotate(-5deg);
  }
  90% {
    left: 50%;
    transform: translateY(-50%) scale(1.1) rotate(0deg);
  }
  100% {
    left: 50%;
    transform: translateY(-50%) scale(1);
  }
}

@keyframes pulseGrow {
  0% {
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(1.1);
    opacity: 1;
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
  }
}

@keyframes popAndFade {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

@keyframes heartBurst {
  0% {
    font-size: 0;
    opacity: 0;
  }
  50% {
    font-size: 10rem;
    opacity: 1;
  }
  80% {
    font-size: 8rem;
    opacity: 0.8;
  }
  100% {
    font-size: 6rem;
    opacity: 0.6;
  }
}

@keyframes fromBird {
  0% {
    opacity: 0;
    transform: translate(calc(50vw - 50%), calc(50vh - 50%)) scale(0.1);
  }
  50% {
    opacity: 0.8;
    transform: translate(0, 0) scale(0.6);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Help button styling */
.help-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  border: 2px solid white;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.help-button:hover {
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.5);
}

/* Instruction dialog styling */
.instruction-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.instruction-dialog {
  background-color: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: scaleIn 0.3s ease;
}

.instruction-dialog-header {
  background-color: #ff9a9e;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instruction-dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.instruction-dialog-content {
  padding: 20px;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.5;
}

.instruction-dialog-content p {
  margin: 10px 0;
}

.instruction-dialog-footer {
  padding: 15px 20px;
  text-align: center;
  border-top: 1px solid #eee;
}

.got-it-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 10px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.got-it-button:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

/* Media queries for different screen sizes */
@media (max-width: 768px) {
  .cake-table-setup {
    width: 500px;
    height: 500px;
  }
  
  .candle-wrapper {
    transform: scale(0.35);
  }
  
  .candle1 {   top: 17%; }
  .candle2 {   top: 17%; }
  .candle3 {   top: 17%; }
  .candle4 {   top: 17%; }
  .candle5 {   top: 17%;}
  
  .birthday-letter {
    font-size: 2.5rem;
  }
  
  .bird {
    width: 150px;
    height: 150px;
  }
  
  .balloon-img {
    width: 100px;
  }
  
  .notebook-paper {
    width: 90%;
    height: 65vh;
  }
  
  .notebook-header {
    width: 30px;
  }
  
  .red-margin {
    left: 22px;
  }
  
  .notebook-content {
    padding: 25px 30px 25px 40px;
    background-size: 100% 26px;
    background-position: 0 25px;
  }
  
  .typewriter-text {
    font-size: 1.4rem;
    line-height: 26px;
  }
  
  .help-button {
    width: 36px;
    height: 36px;
    font-size: 1.3rem;
  }
  
  .instruction-dialog-header h2 {
    font-size: 1.3rem;
  }
  
  .instruction-dialog-content {
    font-size: 1rem;
  }
  
  .got-it-button {
    font-size: 1rem;
    padding: 8px 25px;
  }
  
  .memories-text-bottom {
    font-size: 1.8rem;
    bottom: 20px;
  }
}

@media (max-width: 480px) {
  .cake-table-setup {
    width: 400px;
    height: 400px;
  }
  
  .candle-wrapper {
    transform: scale(0.3);
  }
  
  .candle1 {   top: 12%; }
  .candle2 {   top: 12%; }
  .candle3 {   top: 12%; }
  .candle4 {   top: 12%; }
  .candle5 {   top: 12%; }
  
  .birthday-letter {
    font-size: 2rem;
  }
  
  .bird {
    width: 120px;
    height: 120px;
  }
  
  .balloon-img {
    width: 80px;
  }
  
  .notebook-paper {
    width: 95%;
    height: auto;
    min-height: 50vh;
    max-height: 70vh;
  }
  
  .notebook-header {
    width: 20px;
  }
  
  .red-margin {
    left: 15px;
  }
  
  .notebook-content {
    padding: 20px 20px 20px 30px;
    background-size: 100% 24px;
    background-position: 0 23px;
  }
  
  .typewriter-text {
    font-size: 1.2rem;
    line-height: 24px;
    top: -4px;
  }
  
  .tap-to-continue {
    bottom: 20px;
    font-size: 1rem;
  }
  
  .birthday-text-line {
    max-width: 95%;
  }
  
  .help-button {
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
    bottom: 15px;
    right: 15px;
  }
  
  .instruction-dialog-header h2 {
    font-size: 1.2rem;
  }
  
  .instruction-dialog-content {
    font-size: 0.9rem;
    padding: 15px;
  }
  
  .got-it-button {
    font-size: 0.9rem;
    padding: 8px 20px;
  }
  
  .memories-text-bottom {
    font-size: 1.5rem;
    bottom: 20px;
  }
}

/* Reply section styling */
.reply-section {
  margin-top: 30px;
  font-family: 'Dancing Script', cursive;
}

.type-your-reply {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 10px;
}

.reply-input-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  background-color: transparent;
}

.reply-input {
  width: 100%;
  padding: 5px 0;
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem;
  color: #333;
  border: none;
  background-color: transparent;
  border-bottom: 1px dashed #aaa;
  outline: none;
  line-height: 28px; /* Match the notebook line height */
}

.cursor-blink {
  position: absolute;
  right: 0;
  bottom: 5px;
  width: 2px;
  height: 24px;
  background-color: #333;
  animation: cursorBlink 1s infinite;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.send-button {
  font-family: 'Dancing Script', cursive;
  font-size: 1.4rem;
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 20px;
  padding: 5px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.send-button:hover {
  background-color: #ff6b6b;
  color: white;
}

.user-reply {
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem;
  color: #333;
  margin: 20px 0;
  line-height: 28px;
}

.love-response {
  font-family: 'Dancing Script', cursive;
  font-size: 1.8rem;
  color: #ff6b6b;
  margin: 20px 0;
  line-height: 28px;
  animation: fadeIn 1s forwards;
}

/* Clickable container */
.clickable {
  cursor: pointer;
}

/* Conversation styling */
.conversation-container {
  margin-top: 30px;
  font-family: 'Dancing Script', cursive;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.conversation-message {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message-sender {
  font-size: 1.3rem;
  font-weight: bold;
  color: #555;
}

.message-content {
  font-size: 1.6rem;
  color: #333;
  line-height: 28px;
}

.user-message .message-sender {
  color: #577590;
}

.response-message .message-sender {
  color: #ff6b6b;
}

.response-message .message-content {
  color: #ff6b6b;
  animation: fadeIn 1s forwards;
}

/* Letter closing animation */
.letter-closing {
  animation: closeLetterAnimation 2s forwards;
}

@keyframes closeLetterAnimation {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(0.8) rotate(5deg);
  }
  100% {
    transform: scale(0) rotate(15deg);
    opacity: 0;
  }
}

/* Fly away animation for notebook - updated to be smoother */
.fly-away {
  animation: flyAwayPaper 3s forwards;
}

@keyframes flyAwayPaper {
  0% {
    transform: translate(0, 0) scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: translate(0, 0) scale(0.2) rotate(5deg);
    opacity: 0.3;
  }
  100% {
    transform: translate(100vw, -100vh) scale(0.1) rotate(45deg);
    opacity: 0;
  }
}

/* Fly away animation for bird - updated to start from center */
.fly-away-animation {
  animation: flyAway 3s forwards !important;
}

@keyframes flyAway {
  0% {
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }
  20% {
    left: 55%;
    transform: translateY(-55%) translateX(-50%) rotate(5deg);
  }
  60% {
    left: 80%;
    transform: translateY(-70%) translateX(0) rotate(10deg);
  }
  100% {
    left: 120%;
    transform: translateY(-100%) translateX(0) rotate(20deg);
  }
}
</style>