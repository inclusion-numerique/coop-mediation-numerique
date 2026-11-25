import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<void, string>>
>('marquer-l-onboarding-comme-vu.action')
