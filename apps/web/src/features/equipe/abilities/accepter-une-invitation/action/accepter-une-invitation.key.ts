import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { AccepterUneInvitationValidation } from './accepter-une-invitation.validation'

export const ACCEPTER_UNE_INVITATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AccepterUneInvitationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('accepter-une-invitation.action')
