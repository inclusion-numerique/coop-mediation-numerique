'use client'

import ReactDOM, { PreloadOptions } from 'react-dom'
import marianneBold from '../../public/dsfr/fonts/Marianne-Bold.woff2'
import marianneMedium from '../../public/dsfr/fonts/Marianne-Medium.woff2'
import marianneRegular from '../../public/dsfr/fonts/Marianne-Regular.woff2'

// Les polices sont importées, et non désignées par leur chemin dans `public/`. Depuis que la
// feuille du DSFR est empaquetée, le bundler réécrit ses `url()` vers `/_next/static/media/`
// avec un hash de contenu : précharger `/dsfr/fonts/…` téléchargerait trois fichiers que la
// CSS n'utilise plus. L'import rend la même URL que celle référencée par la feuille.
const fontsToPreload = [marianneRegular, marianneBold, marianneMedium]

export const PreloadResources = () => {
  for (const font of fontsToPreload) {
    ReactDOM.preload(font, {
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    } as PreloadOptions)
  }

  return null
}
