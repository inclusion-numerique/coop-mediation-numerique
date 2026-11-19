import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { ValiderValidation } from './valider.validation'

export const VALIDER_ACTION_KEY =
  keyFor<
    (
      input: z.input<typeof ValiderValidation>,
    ) => Promise<ServerActionResult<unknown, string>>
  >('valider.action')
