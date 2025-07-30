export default defineNuxtPlugin((nuxtApp) => {
  // This plugin will help with asset handling
  return {
    provide: {
      getAssetUrl: (path) => {
        // For assets in the assets directory, we need to use the import.meta.url approach
        if (path.startsWith('/assets/')) {
          // Remove the /assets/ prefix for proper importing
          const assetPath = path.replace('/assets/', '/')
          return new URL(`../assets${assetPath}`, import.meta.url).href
        }
        return path
      }
    }
  }
}) 