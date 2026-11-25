import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const RELANCER_LES_INSCRITS_INACTIFS_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<{ readonly traites: number }, string>>
>('relancer-les-inscrits-inactifs.action')
