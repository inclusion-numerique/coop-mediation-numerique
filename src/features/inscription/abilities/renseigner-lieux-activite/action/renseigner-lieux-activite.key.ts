import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { RenseignerLieuxActiviteValidation } from './renseigner-lieux-activite.validation'

export const RENSEIGNER_LIEUX_ACTIVITE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RenseignerLieuxActiviteValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('renseigner-lieux-activite.action')
