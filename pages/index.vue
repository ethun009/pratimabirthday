<script setup>
const isLoading = ref(false)
const loadingProgress = ref(0)
const isLoaded = ref(false)
const loadingErrors = ref([])
const showQualityDialog = ref(false)
const loadingSpeed = ref('0 KB/s')
const useUpscaledImages = ref(false)

// Assets that will always be loaded regardless of quality choice
const commonAssets = [
  // Static images
  '/assets/balloons.png',
  '/assets/cake.png',
  '/assets/dove.gif',
  '/assets/heartballoon.png',
  '/assets/letter-envelope.png',
  '/assets/table.png',
  
  // Girl folder images
  '/assets/girl/pic1.png',
  '/assets/girl/pic2.png',
  '/assets/girl/pic3.png',
  '/assets/girl/pic4.png',
  '/assets/girl/pic5.png',
  
  // Songs
  '/assets/songs/Bhalobashi Bole Dao.mp3',
  '/assets/songs/Timro Pratiksa.mp3',
  '/assets/songs/Tum Jo Aaye.mp3',
  
  // Voice files
  '/assets/voice/And in that moment.wav',
  '/assets/voice/And now that you hold it.wav',
  '/assets/voice/Did you feel it.wav',
  '/assets/voice/Distance means nothing .wav',
  '/assets/voice/From Bangladesh, with all my love.wav',
  '/assets/voice/I knew you also love me.wav',
  '/assets/voice/Somewhere far away, under the same sky… I think of you.wav',
  '/assets/voice/That\'s me… arriving in your heart.wav',
  '/assets/voice/With every beat of my heart.wav',
  '/assets/voice/bg song.wav',
  '/assets/voice/bg song1.wav',
  '/assets/voice/letter.wav',
  '/assets/voice/when a heart knows.wav',
  
  // Other video files that are always loaded
  
  '/assets/16-9/videos/boy_sending_love.mp4',
  '/assets/16-9/videos/boy_standing1.mp4',
  '/assets/16-9/videos/girl_asking.mp4',
  '/assets/16-9/videos/girl_catching_love.mp4',
  '/assets/16-9/videos/girl_grabing_love.mp4',
  
 
  '/assets/9-16/videos/boy_sending_love.mp4',
  '/assets/9-16/videos/boy_standing.mp4',
  '/assets/9-16/videos/girl_asking.mp4',
  '/assets/9-16/videos/girl_catching_love.mp4',
  '/assets/9-16/videos/girl_grabing_love.mp4',
]

// Assets that will be loaded based on quality choice
const normalQualityAssets = [
  // Normal quality images and videos
  '/assets/16-9/normal_images/boy_sending_love.jpg',
  '/assets/16-9/normal_images/boy_standing.jpg',
  '/assets/16-9/normal_images/girl_catching_love.jpg',
  '/assets/16-9/normal_images/girl_grabing_love.jpg',
  '/assets/9-16/normal_images/boy_sending_love.jpg',
  '/assets/9-16/normal_images/boy_standing.jpg',
  '/assets/9-16/normal_images/girl_catching_love.jpg',
  '/assets/9-16/normal_images/girl_grabing_love.jpg',
  '/assets/16-9/videos/map_anim.mp4',
  '/assets/9-16/videos/map_anim.mp4',
]

// Add these constants for Google Drive links
// Removing these links as videos are now in public assets folder
// const driveVideoLinks = {
//   '/assets/16-9/videos/map_anim_upscale.mp4': 'https://drive.google.com/file/d/12qX1MJiFSZwCDnD4ydZJOZ1bv_qhvSAI/view?usp=sharing',
//   '/assets/9-16/videos/map_anim_upscale.mp4': 'https://drive.google.com/file/d/1DgEb9aFwGEBWzGQZqTYOGtbrIEHiq4yc/view?usp=sharing'
// }

// Modify the upscaledQualityAssets array to include the local upscaled videos
const upscaledQualityAssets = [
  // Upscaled quality images and videos
  '/assets/16-9/upscaled_images/boy_sending_love.png',
  '/assets/16-9/upscaled_images/boy_standing.png',
  '/assets/16-9/upscaled_images/girl_catching_love.png',
  '/assets/16-9/upscaled_images/girl_grabing_love.png',
  '/assets/9-16/upscaled_images/boy_sending_love.png',
  '/assets/9-16/upscaled_images/boy_standing.png',
  '/assets/9-16/upscaled_images/girl_catching_love.png',
  '/assets/9-16/upscaled_images/girl_grabing_love.png',
  // Now including the local upscaled videos
  '/assets/16-9/videos/map_anim_upscale.mp4',
  '/assets/9-16/videos/map_anim_upscale.mp4',
]

// Replace Google Drive links with Dropbox links
// Removing these links as videos are now in public assets folder
// const dropboxVideoLinks = {
//   '/assets/16-9/videos/map_anim_upscale.mp4': 'https://www.dropbox.com/scl/fi/6cjfuej634kv7hqwj2ly8/map_anim_upscale.mp4?rlkey=zdhg8m1i8a9a2n7qlqcibb55f&st=m1ncurrk&dl=1',
//   '/assets/9-16/videos/map_anim_upscale.mp4': 'https://www.dropbox.com/scl/fi/c414m1uddjeq9lussx3kb/map_anim_upscale_9_16.mp4?rlkey=dk2ifighs5vicanf6irkf2j14&st=32vsv7ha&dl=1'
// }

// Update the selectQuality function to simply load assets without downloading from Dropbox
function selectQuality(useUpscaled) {
  const { setQualitySelection } = useQualitySelection()
  setQualitySelection(useUpscaled)
  useUpscaledImages.value = useUpscaled
  showQualityDialog.value = false
  
  // Start loading regular assets
  startLoading()
}

function showQualitySelection() {
  showQualityDialog.value = true
}

// Remove this redundant function
// function selectQuality(useUpscaled) {
//   const { setQualitySelection } = useQualitySelection()
//   setQualitySelection(useUpscaled)
//   useUpscaledImages.value = useUpscaled
//   showQualityDialog.value = false
//   startLoading()
// }

function startLoading() {
  isLoading.value = true
  
  // Determine which assets to load based on quality choice
  const qualityAssets = useUpscaledImages.value ? upscaledQualityAssets : normalQualityAssets
  const assets = [...commonAssets, ...qualityAssets]
  
  // Preload all assets
  const totalAssets = assets.length
  let loadedAssets = 0
  
  assets.forEach(asset => {
    // Create the appropriate element based on file extension
    let element;
    
    if (asset.endsWith('.mp4') || asset.endsWith('.mp3')) {
      // Video or audio files
      element = document.createElement('video')
    } else if (asset.endsWith('.wav')) {
      // WAV audio files
      element = document.createElement('audio')
    } else {
      // Images (jpg, png, gif, etc)
      element = document.createElement('img')
    }
    
    element.src = asset
    console.log(`Loading asset: ${asset}`)
    
    // Use appropriate event handlers based on element type
    if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
      element.onloadeddata = () => {
        loadedAssets++
        console.log(`Successfully loaded: ${asset}`)
        loadingProgress.value = Math.floor((loadedAssets / totalAssets) * 100)
        
        if (loadedAssets === totalAssets) {
          // All assets loaded
          setTimeout(() => {
            isLoaded.value = true
            navigateTo('/main')
          }, 500)
        }
      }
    } else {
      // For images
      element.onload = () => {
        loadedAssets++
        console.log(`Successfully loaded: ${asset}`)
        loadingProgress.value = Math.floor((loadedAssets / totalAssets) * 100)
        
        if (loadedAssets === totalAssets) {
          // All assets loaded
          setTimeout(() => {
            isLoaded.value = true
            navigateTo('/main')
          }, 500)
        }
      }
    }
    
    element.onerror = (e) => {
      // Even if error, count as loaded to avoid getting stuck
      loadedAssets++
      console.error(`Failed to load: ${asset}`, e)
      loadingErrors.value.push(asset)
      loadingProgress.value = Math.floor((loadedAssets / totalAssets) * 100)
      
      if (loadedAssets === totalAssets) {
        // All assets loaded
        setTimeout(() => {
          isLoaded.value = true
          navigateTo('/main')
        }, 500)
      }
    }
  })
  
  // Simulate minimum loading time with progress animation
  let progress = 0
  const interval = setInterval(() => {
    progress += 1
    if (progress >= 100) {
      clearInterval(interval)
    }
    // Only update if the actual loading is slower than our animation
    if (progress > loadingProgress.value) {
      loadingProgress.value = progress
    }
  }, 100)
}
</script>

<template>
  <div class="welcome-container">
    <div v-if="!isLoading && !showQualityDialog" class="dialogue-box">
      <h1 class="title">To You, From Miles Away…</h1>
      <button class="begin-button" @click="showQualitySelection">Let's Begin</button>
    </div>
    
    <div v-if="showQualityDialog" class="dialogue-box quality-dialog">
      <h2>Choose Image Quality</h2>
      <p class="quality-warning">Loading upscaled images will take more time but provide better quality.</p>
      <div class="quality-buttons">
        <button class="quality-button" @click="selectQuality(false)">Normal Quality</button>
        <button class="quality-button upscaled" @click="selectQuality(true)">Upscaled Quality</button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <h2>Loading your special memories...</h2>
      <div class="loading-speed">{{ loadingSpeed }}</div>
      <div class="loading-bar-container">
        <div class="loading-bar" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
      <div class="loading-percentage">{{ loadingProgress }}%</div>
      <div v-if="loadingErrors.length > 0" class="loading-errors">
        <p>Some assets failed to load:</p>
        <ul>
          <li v-for="(error, index) in loadingErrors" :key="index">{{ error }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
}

/* Add floating particles */
.welcome-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 5%),
    radial-gradient(circle at 75% 44%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 6%),
    radial-gradient(circle at 46% 52%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 4%),
    radial-gradient(circle at 35% 80%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 5%),
    radial-gradient(circle at 80% 15%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 4%);
  animation: float 15s ease-in-out infinite alternate;
}

.dialogue-box {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  padding: 40px;
  text-align: center;
  max-width: 500px;
  animation: fadeIn 1.5s ease-out, float 6s ease-in-out infinite;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

/* Add subtle gradient overlay */
.dialogue-box::before {
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

.title {
  font-size: 2.8rem;
  color: white;
  margin-bottom: 35px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.begin-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 15px 40px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 139, 0.4);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.begin-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: 0.5s;
}

.begin-button:hover::after {
  left: 100%;
}

.begin-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 139, 0.6);
  background: rgba(255, 255, 255, 0.3);
}

.begin-button:active {
  transform: translateY(1px);
}

/* Quality dialog styles */
.quality-dialog h2 {
  color: white;
  margin-bottom: 15px;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.quality-warning {
  color: white;
  margin-bottom: 25px;
  font-size: 1rem;
  opacity: 0.9;
}

.quality-buttons {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.quality-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 25px;
  font-size: 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
}

.quality-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 139, 0.5);
  background: rgba(255, 255, 255, 0.25);
}

.quality-button.upscaled {
  background: rgba(255, 107, 139, 0.3);
}

.loading-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  padding: 40px;
  text-align: center;
  width: 80%;
  max-width: 600px;
  position: relative;
  z-index: 10;
}

.loading-container h2 {
  color: white;
  margin-bottom: 15px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 1.8rem;
  letter-spacing: 0.5px;
}

.loading-speed {
  color: white;
  font-size: 0.9rem;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.1);
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: 500;
}

.loading-bar-container {
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.loading-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b8b, #ffa3a3);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.loading-percentage {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
}

.loading-errors {
  margin-top: 20px;
  color: #ff3366;
  text-align: left;
  font-size: 0.9rem;
  max-height: 100px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 10px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.loading-errors ul {
  margin-top: 8px;
  padding-left: 20px;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Media queries */
@media (max-width: 768px) {
  .title {
    font-size: 2.2rem;
    margin-bottom: 25px;
  }
  
  .begin-button {
    padding: 12px 30px;
    font-size: 1.1rem;
  }
  
  .loading-container h2 {
    font-size: 1.5rem;
  }
  
  .dialogue-box, .loading-container {
    padding: 30px;
    width: 85%;
  }
  
  .quality-buttons {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }
  
  .begin-button {
    padding: 10px 25px;
    font-size: 1rem;
  }
  
  .dialogue-box, .loading-container {
    padding: 25px;
    width: 90%;
  }
}
</style>