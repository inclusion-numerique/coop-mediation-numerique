import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { FusionnerUnTagValidation } from './fusionner-un-tag.validation'

export const FUSIONNER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof FusionnerUnTagValidation>,
  ) => Promise<ServerActionResult<{ nom: string }, string>>
>('fusionner-un-tag.action')
