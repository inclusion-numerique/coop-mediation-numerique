import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<unknown, string>>
>('activer-la-mediation-numerique.action')
