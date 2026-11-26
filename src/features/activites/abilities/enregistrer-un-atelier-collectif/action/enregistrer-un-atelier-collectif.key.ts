import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { AtelierEnregistre } from './enregistrer-un-atelier-collectif.transfer'
import type { EnregistrerUnAtelierCollectifValidation } from './enregistrer-un-atelier-collectif.validation'

export const ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY = keyFor<
  (
    input: z.input<typeof EnregistrerUnAtelierCollectifValidation>,
  ) => Promise<ServerActionResult<AtelierEnregistre, string>>
>('enregistrer-un-atelier-collectif.action')
