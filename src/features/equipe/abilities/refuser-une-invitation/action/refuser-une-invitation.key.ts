import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { RefuserUneInvitationValidation } from './refuser-une-invitation.validation'

export const REFUSER_UNE_INVITATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RefuserUneInvitationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('refuser-une-invitation.action')
