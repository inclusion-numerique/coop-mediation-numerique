import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'

export const TERMINER_L_USURPATION_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<{ readonly nom: string }, string>>
>('terminer-l-usurpation.action')
