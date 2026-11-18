import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<unknown, string>>
>('activer-la-mediation-numerique.action')
