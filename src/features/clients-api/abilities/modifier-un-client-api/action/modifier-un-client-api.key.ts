import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { ModifierUnClientApiValidation } from './modifier-un-client-api.validation'

export const MODIFIER_UN_CLIENT_API_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ModifierUnClientApiValidation>,
  ) => Promise<ServerActionResult<{ readonly clientApiId: string }, string>>
>('modifier-un-client-api.action')
