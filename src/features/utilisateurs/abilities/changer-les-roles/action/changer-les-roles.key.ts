import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { ChangerLesRolesValidation } from './changer-les-roles.validation'

export const CHANGER_LES_ROLES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof ChangerLesRolesValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('changer-les-roles.action')
