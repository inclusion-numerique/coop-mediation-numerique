import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY = keyFor<
  () => Promise<
    ServerActionResult<
      { readonly derive: number; readonly synchroniseeLe: Date | null },
      string
    >
  >
>('rattraper-rdvs-sans-webhook.action')
