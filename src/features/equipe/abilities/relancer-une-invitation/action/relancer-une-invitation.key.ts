import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { RelancerUneInvitationValidation } from './relancer-une-invitation.validation'

export const RELANCER_UNE_INVITATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RelancerUneInvitationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('relancer-une-invitation.action')
