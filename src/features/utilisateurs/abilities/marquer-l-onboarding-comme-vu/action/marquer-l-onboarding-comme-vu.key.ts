import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY = keyFor<
  () => Promise<ServerActionResult<void, string>>
>('marquer-l-onboarding-comme-vu.action')
