import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { ModifierUnClientApiValidation } from './modifier-un-client-api.validation'

export const MODIFIER_UN_CLIENT_API_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ModifierUnClientApiValidation>,
  ) => Promise<ServerActionResult<{ readonly clientApiId: string }, string>>
>('modifier-un-client-api.action')
