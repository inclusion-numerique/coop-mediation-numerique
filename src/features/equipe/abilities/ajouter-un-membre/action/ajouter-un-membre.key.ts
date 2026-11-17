import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { AjouterUnMembreValidation } from './ajouter-un-membre.validation'

export const AJOUTER_UN_MEMBRE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AjouterUnMembreValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('ajouter-un-membre.action')
