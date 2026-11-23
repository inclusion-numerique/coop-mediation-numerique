import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<void, string>>
>('marquer-l-onboarding-comme-vu.action')
