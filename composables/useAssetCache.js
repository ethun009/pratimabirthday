export const useAssetCache = () => {
  // Use useState to create shared state that persists between page navigations
  const cachedAssets = useState('cachedAssets', () => ({}))
  const assetsLoaded = useState('assetsLoaded', () => false)
  
  // Function to check if all required assets are cached
  const areAssetsCached = (assetUrls) => {
    if (!assetsLoaded.value) return false
    
    // Check if all required assets are in the cache
    return assetUrls.every(url => cachedAssets.value[url])
  }
  
  // Function to mark assets as loaded
  const setAssetsLoaded = (loaded) => {
    assetsLoaded.value = loaded
  }
  
  // Function to add an asset to the cache
  const cacheAsset = (url, element) => {
    cachedAssets.value[url] = true
  }
  
  // Function to preload an asset and add it to the cache
  const preloadAsset = (url) => {
    return new Promise((resolve, reject) => {
      // Skip if already cached
      if (cachedAssets.value[url]) {
        resolve(url)
        return
      }
      
      let element
      
      if (url.endsWith('.mp4') || url.endsWith('.mp3')) {
        element = document.createElement('video')
      } else if (url.endsWith('.wav')) {
        element = document.createElement('audio')
      } else {
        element = document.createElement('img')
      }
      
      // Set up load handlers
      if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
        element.onloadeddata = () => {
          cacheAsset(url, element)
          resolve(url)
        }
      } else {
        element.onload = () => {
          cacheAsset(url, element)
          resolve(url)
        }
      }
      
      element.onerror = (e) => {
        console.error(`Failed to preload: ${url}`, e)
        // Still mark as cached to avoid repeated attempts
        cacheAsset(url, element)
        reject(e)
      }
      
      // Start loading
      element.src = url
      
      // Store the element in the DOM to ensure it stays cached
      const cacheContainer = document.querySelector('.asset-cache-container') || document.createElement('div')
      if (!cacheContainer.classList.contains('asset-cache-container')) {
        cacheContainer.style.display = 'none'
        cacheContainer.classList.add('asset-cache-container')
        document.body.appendChild(cacheContainer)
      }
      cacheContainer.appendChild(element)
    })
  }
  
  return {
    cachedAssets,
    assetsLoaded,
    areAssetsCached,
    setAssetsLoaded,
    cacheAsset,
    preloadAsset
  }
}