import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ModifierUnTagValidation } from './modifier-un-tag.validation'

export const MODIFIER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ModifierUnTagValidation>,
  ) => Promise<ServerActionResult<{ nom: string }, string>>
>('modifier-un-tag.action')
