import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY = keyFor<
  (input: {
    rdvId: number
  }) => Promise<ServerActionResult<{ readonly urlCreationCra: string }, string>>
>('creer-activite-depuis-rdv.action')
