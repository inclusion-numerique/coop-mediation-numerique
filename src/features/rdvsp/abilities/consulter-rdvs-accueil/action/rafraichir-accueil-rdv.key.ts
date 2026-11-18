import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { RafraichissementAccueil } from '../domain/rafraichissement-accueil'

export const RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<RafraichissementAccueil, string>>
>('rafraichir-accueil-rdv.action')
