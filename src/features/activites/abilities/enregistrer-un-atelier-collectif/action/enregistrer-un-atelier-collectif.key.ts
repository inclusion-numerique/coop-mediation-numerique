import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { AtelierEnregistre } from '../domain'
import type { EnregistrerUnAtelierCollectifValidation } from './enregistrer-un-atelier-collectif.validation'

export const ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY = keyFor<
  (
    input: z.input<typeof EnregistrerUnAtelierCollectifValidation>,
  ) => Promise<ServerActionResult<AtelierEnregistre, string>>
>('enregistrer-un-atelier-collectif.action')
