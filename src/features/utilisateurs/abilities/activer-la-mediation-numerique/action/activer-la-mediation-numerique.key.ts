import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<unknown, string>>
>('activer-la-mediation-numerique.action')
