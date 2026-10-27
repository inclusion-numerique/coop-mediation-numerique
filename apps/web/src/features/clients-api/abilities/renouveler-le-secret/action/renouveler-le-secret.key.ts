import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { RenouvelerLeSecretValidation } from './renouveler-le-secret.validation'

export const RENOUVELER_LE_SECRET_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RenouvelerLeSecretValidation>,
  ) => Promise<ServerActionResult<{ readonly secret: string }, string>>
>('renouveler-le-secret.action')
