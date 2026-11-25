import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { RetirerUnMembreValidation } from './retirer-un-membre.validation'

export const RETIRER_UN_MEMBRE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RetirerUnMembreValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('retirer-un-membre.action')
