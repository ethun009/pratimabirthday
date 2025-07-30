// Background music plugin that persists across page navigations
export default defineNuxtPlugin((nuxtApp) => {
  // Create a state to track if music is initialized
  const isMusicInitialized = ref(false)
  const bgMusic = ref(null)
  const isPlaying = ref(false)
  const normalVolume = 0.5 // Store the normal volume level
  const reducedVolume = 0.2 // 60% of normal volume (0.5 * 0.6 = 0.3)
  // Function to initialize music
  const initMusic = () => {
    if (isMusicInitialized.value) return
    
    // Create audio element
    bgMusic.value = new Audio('/assets/voice/bg song.wav')
    
    // Set properties
    bgMusic.value.loop = true
    bgMusic.value.volume = normalVolume
    
    // Add ended event to replay
    bgMusic.value.addEventListener('ended', () => {
      // Restart the song when it ends
      bgMusic.value.currentTime = 0
      bgMusic.value.play().catch(error => {
        console.error('Error replaying background music:', error)
      })
    })
    
    isMusicInitialized.value = true
  }
  
  // Function to play music
  const playMusic = () => {
    if (!isMusicInitialized.value) {
      initMusic()
    }
    
    if (bgMusic.value && !isPlaying.value) {
      bgMusic.value.play().then(() => {
        isPlaying.value = true
        // Save state to localStorage
        localStorage.setItem('bgMusicPlaying', 'true')
      }).catch(error => {
        console.error('Error playing background music:', error)
      })
    }
  }
  
  // Function to pause music
  const pauseMusic = () => {
    if (bgMusic.value && isPlaying.value) {
      bgMusic.value.pause()
      isPlaying.value = false
      // Save state to localStorage
      localStorage.setItem('bgMusicPlaying', 'false')
    }
  }
  
  // New function to decrease volume smoothly when other audio plays
  const decreaseVolume = () => {
    if (!bgMusic.value || !isPlaying.value) return
    
    // Smoothly decrease volume to 60% of normal volume
    const fadeInterval = 50 // Update every 50ms
    const fadeDuration = 500 // Complete in 500ms
    const steps = fadeDuration / fadeInterval
    const volumeStep = (normalVolume - reducedVolume) / steps
    
    let currentStep = 0
    const fadeIntervalId = setInterval(() => {
      currentStep++
      const newVolume = normalVolume - (volumeStep * currentStep)
      
      if (currentStep >= steps || newVolume <= reducedVolume) {
        bgMusic.value.volume = reducedVolume
        clearInterval(fadeIntervalId)
      } else {
        bgMusic.value.volume = newVolume
      }
    }, fadeInterval)
  }
  
  // New function to restore volume smoothly when other audio stops
  const restoreVolume = () => {
    if (!bgMusic.value || !isPlaying.value) return
    
    // Smoothly increase volume back to normal
    const fadeInterval = 50 // Update every 50ms
    const fadeDuration = 500 // Complete in 500ms
    const steps = fadeDuration / fadeInterval
    const volumeStep = (normalVolume - reducedVolume) / steps
    
    let currentStep = 0
    const fadeIntervalId = setInterval(() => {
      currentStep++
      const newVolume = reducedVolume + (volumeStep * currentStep)
      
      if (currentStep >= steps || newVolume >= normalVolume) {
        bgMusic.value.volume = normalVolume
        clearInterval(fadeIntervalId)
      } else {
        bgMusic.value.volume = newVolume
      }
    }, fadeInterval)
  }
  
  // Function to check if we should play music on this page
  const shouldPlayMusicOnPage = (route) => {
    // Don't play on memories page
    return route !== '/memories'
  }
  
  // Add route change handler
  nuxtApp.hook('page:start', () => {
    // Get current route
    const route = window.location.pathname
    
    if (shouldPlayMusicOnPage(route)) {
      // Check if music was playing before
      const wasMusicPlaying = localStorage.getItem('bgMusicPlaying') === 'true'
      
      if (wasMusicPlaying || !localStorage.getItem('bgMusicPlaying')) {
        // Start music if it was playing before or first time
        playMusic()
      }
    } else {
      // Pause music on memories page
      pauseMusic()
    }
  })
  
  // Initialize on client side only
  if (process.client) {
    // Wait for document to be ready
    nuxtApp.hook('app:mounted', () => {
      const route = window.location.pathname
      
      if (shouldPlayMusicOnPage(route)) {
        // Start playing on initial page load
        playMusic()
      }
    })
  }
  
  return {
    provide: {
      bgMusic: {
        play: playMusic,
        pause: pauseMusic,
        isPlaying: () => isPlaying.value,
        decreaseVolume: decreaseVolume,
        restoreVolume: restoreVolume
      }
    }
  }
})