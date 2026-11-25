import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const RELANCER_LES_INSCRIPTIONS_INACHEVEES_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<{ readonly traites: number }, string>>
>('relancer-les-inscriptions-inachevees.action')
