export const useQualitySelection = () => {
  // Use useState from Nuxt to create shared state that persists between page navigations
  const useUpscaledImages = useState('useUpscaledImages', () => {
    // Try to get the value from localStorage if available (for page refreshes)
    if (process.client) {
      const stored = localStorage.getItem('useUpscaledImages')
      return stored ? stored === 'true' : false
    }
    return false
  })

  // Function to set the quality selection and save to localStorage
  const setQualitySelection = (useUpscaled) => {
    useUpscaledImages.value = useUpscaled
    if (process.client) {
      localStorage.setItem('useUpscaledImages', useUpscaled.toString())
    }
  }

  // Helper function to get the correct asset path based on quality selection
  const getQualityAssetPath = (normalPath, upscaledPath) => {
    return useUpscaledImages.value ? upscaledPath : normalPath
  }

  return {
    useUpscaledImages,
    setQualitySelection,
    getQualityAssetPath
  }
}