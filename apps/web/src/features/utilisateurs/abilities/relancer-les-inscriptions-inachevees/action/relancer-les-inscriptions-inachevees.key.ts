import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const RELANCER_LES_INSCRIPTIONS_INACHEVEES_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<{ readonly traites: number }, string>>
>('relancer-les-inscriptions-inachevees.action')
