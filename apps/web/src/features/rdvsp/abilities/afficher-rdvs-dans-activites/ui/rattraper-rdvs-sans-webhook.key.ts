import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY = keyFor<
  () => Promise<
    ServerActionResult<
      { readonly derive: number; readonly synchroniseeLe: Date | null },
      string
    >
  >
>('rattraper-rdvs-sans-webhook.action')
