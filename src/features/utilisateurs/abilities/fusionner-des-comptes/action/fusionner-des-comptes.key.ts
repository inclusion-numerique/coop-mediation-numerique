import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { FusionnerDesComptesValidation } from './fusionner-des-comptes.validation'

export const FUSIONNER_DES_COMPTES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof FusionnerDesComptesValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('fusionner-des-comptes.action')
