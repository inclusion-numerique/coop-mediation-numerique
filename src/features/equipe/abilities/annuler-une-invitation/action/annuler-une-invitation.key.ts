import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'
import type { AnnulerUneInvitationValidation } from './annuler-une-invitation.validation'

export const ANNULER_UNE_INVITATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof AnnulerUneInvitationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('annuler-une-invitation.action')
