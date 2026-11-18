import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { ChangerLesRolesValidation } from './changer-les-roles.validation'

export const CHANGER_LES_ROLES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ChangerLesRolesValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('changer-les-roles.action')
