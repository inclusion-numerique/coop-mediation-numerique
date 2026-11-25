import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { RafraichissementAccueil } from '../domain/rafraichissement-accueil'

export const RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<RafraichissementAccueil, string>>
>('rafraichir-accueil-rdv.action')
