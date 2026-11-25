import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY = keyFor<
  (input: {
    rdvId: number
  }) => Promise<ServerActionResult<{ readonly urlCreationCra: string }, string>>
>('creer-activite-depuis-rdv.action')
