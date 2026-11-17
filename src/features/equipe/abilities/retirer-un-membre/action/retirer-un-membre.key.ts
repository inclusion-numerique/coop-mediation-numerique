import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { RetirerUnMembreValidation } from './retirer-un-membre.validation'

export const RETIRER_UN_MEMBRE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RetirerUnMembreValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('retirer-un-membre.action')
