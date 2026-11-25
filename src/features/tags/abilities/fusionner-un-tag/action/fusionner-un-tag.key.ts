import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { FusionnerUnTagValidation } from './fusionner-un-tag.validation'

export const FUSIONNER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof FusionnerUnTagValidation>,
  ) => Promise<ServerActionResult<{ nom: string }, string>>
>('fusionner-un-tag.action')
