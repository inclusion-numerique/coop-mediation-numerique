import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { SupprimerUnTagValidation } from './supprimer-un-tag.validation'

export const SUPPRIMER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerUnTagValidation>,
  ) => Promise<ServerActionResult<{ nom: string }, string>>
>('supprimer-un-tag.action')
