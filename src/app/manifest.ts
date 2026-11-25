import type { MetadataRoute } from 'next'
import { projectTitle } from '@/configuration/projet'

const manifest = (): MetadataRoute.Manifest => ({
  name: projectTitle,
  icons: [
    {
      src: '/icons/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
})

export default manifest
