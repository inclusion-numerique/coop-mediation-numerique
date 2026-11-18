import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { AccepterUneInvitationValidation } from './accepter-une-invitation.validation'

export const ACCEPTER_UNE_INVITATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AccepterUneInvitationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('accepter-une-invitation.action')
