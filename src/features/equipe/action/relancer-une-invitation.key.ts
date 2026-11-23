import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const RELANCER_UNE_INVITATION_ACTION_KEY = keyFor<
  (input: {
    email: string
    coordinateurId: string
  }) => Promise<ServerActionResult<void, string>>
>('relancer-une-invitation.action')
