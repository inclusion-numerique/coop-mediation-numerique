import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const TERMINER_L_USURPATION_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<{ readonly nom: string }, string>>
>('terminer-l-usurpation.action')
