import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ValiderValidation } from './valider.validation'

export const VALIDER_ACTION_KEY =
  keyFor<
    (
      input: z.input<typeof ValiderValidation>,
    ) => Promise<ServerActionResult<unknown, string>>
  >('valider.action')
