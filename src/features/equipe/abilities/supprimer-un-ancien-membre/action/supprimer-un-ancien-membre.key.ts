import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { SupprimerUnAncienMembreValidation } from './supprimer-un-ancien-membre.validation'

export const SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerUnAncienMembreValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('supprimer-un-ancien-membre.action')
