import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const ACCEPTER_UNE_INVITATION_ACTION_KEY = keyFor<
  (input: {
    email: string
    coordinateurId: string
  }) => Promise<ServerActionResult<void, string>>
>('accepter-une-invitation.action')
