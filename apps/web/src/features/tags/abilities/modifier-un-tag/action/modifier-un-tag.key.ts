import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { ModifierUnTagValidation } from './modifier-un-tag.validation'

export const MODIFIER_UN_TAG_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ModifierUnTagValidation>,
  ) => Promise<ServerActionResult<{ nom: string }, string>>
>('modifier-un-tag.action')
