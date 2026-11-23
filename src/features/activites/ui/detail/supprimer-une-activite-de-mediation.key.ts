import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY = keyFor<
  (input: { activiteId: string }) => Promise<ServerActionResult<void, string>>
>('supprimer-une-activite-de-mediation.action')
