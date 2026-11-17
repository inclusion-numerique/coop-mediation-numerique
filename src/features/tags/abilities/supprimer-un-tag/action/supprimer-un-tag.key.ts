import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { SupprimerUnTagValidation } from './supprimer-un-tag.validation'

export const SUPPRIMER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerUnTagValidation>,
  ) => Promise<ServerActionResult<{ nom: string }, string>>
>('supprimer-un-tag.action')
