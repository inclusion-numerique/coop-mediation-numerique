import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { CreerUnTagValidation } from './creer-un-tag.validation'

export const CREER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof CreerUnTagValidation>,
  ) => Promise<ServerActionResult<{ readonly nom: string }, string>>
>('creer-un-tag.action')
