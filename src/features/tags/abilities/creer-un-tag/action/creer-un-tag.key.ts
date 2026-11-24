import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { CreerUnTagValidation } from './creer-un-tag.validation'

export const CREER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof CreerUnTagValidation>,
  ) => Promise<ServerActionResult<{ readonly nom: string }, string>>
>('creer-un-tag.action')
