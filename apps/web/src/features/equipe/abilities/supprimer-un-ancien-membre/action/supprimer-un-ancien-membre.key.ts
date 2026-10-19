import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { SupprimerUnAncienMembreValidation } from './supprimer-un-ancien-membre.validation'

export const SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerUnAncienMembreValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('supprimer-un-ancien-membre.action')
