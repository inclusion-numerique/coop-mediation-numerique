import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { AjouterUnMembreValidation } from './ajouter-un-membre.validation'

export const AJOUTER_UN_MEMBRE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AjouterUnMembreValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('ajouter-un-membre.action')
