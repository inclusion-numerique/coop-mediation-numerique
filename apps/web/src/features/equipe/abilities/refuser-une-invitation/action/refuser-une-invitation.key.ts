import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { RefuserUneInvitationValidation } from './refuser-une-invitation.validation'

export const REFUSER_UNE_INVITATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RefuserUneInvitationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('refuser-une-invitation.action')
