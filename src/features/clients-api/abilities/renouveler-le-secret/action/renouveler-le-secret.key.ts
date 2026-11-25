import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { RenouvelerLeSecretValidation } from './renouveler-le-secret.validation'

export const RENOUVELER_LE_SECRET_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RenouvelerLeSecretValidation>,
  ) => Promise<ServerActionResult<{ readonly secret: string }, string>>
>('renouveler-le-secret.action')
