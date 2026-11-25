import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const DECONNECTER_COMPTE_RDV_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<void, string>>
>('deconnecter-compte-rdv.action')
