import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'

export const RELANCER_LES_INSCRITS_INACTIFS_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<{ readonly traites: number }, string>>
>('relancer-les-inscrits-inactifs.action')
