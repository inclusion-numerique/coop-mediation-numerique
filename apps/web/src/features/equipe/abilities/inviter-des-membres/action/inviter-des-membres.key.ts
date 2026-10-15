import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { InvitationsEnvoyees } from '../implementation'
import type { InviterDesMembresValidation } from './inviter-des-membres.validation'

export const INVITER_DES_MEMBRES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof InviterDesMembresValidation>,
  ) => Promise<ServerActionResult<InvitationsEnvoyees, string>>
>('inviter-des-membres.action')
