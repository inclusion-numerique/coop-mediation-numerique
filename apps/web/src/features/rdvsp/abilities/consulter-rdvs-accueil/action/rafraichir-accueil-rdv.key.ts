import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { key } from '@app/web/libs/injection/client'
import type { RafraichissementAccueil } from '../domain/rafraichissement-accueil'

export const RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY = key<
  () => Promise<ServerActionResult<RafraichissementAccueil, string>>
>('rafraichir-accueil-rdv.action')
