import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY = keyFor<
  (input: {
    rdvId: number
  }) => Promise<ServerActionResult<{ readonly urlCreationCra: string }, string>>
>('creer-activite-depuis-rdv.action')
