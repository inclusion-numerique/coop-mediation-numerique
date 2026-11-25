import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { FusionnerDesLieuxValidation } from './fusionner-des-lieux.validation'

export const FUSIONNER_DES_LIEUX_ACTION_KEY = keyFor<
  (
    input: z.input<typeof FusionnerDesLieuxValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('fusionner-des-lieux.action')
