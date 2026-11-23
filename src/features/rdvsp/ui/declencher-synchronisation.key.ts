import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const DECLENCHER_SYNCHRONISATION_ACTION_KEY = keyFor<
  (input: {
    utilisateurId: string
  }) => Promise<
    ServerActionResult<
      { readonly derive: number; readonly synchroniseeLe: Date | null },
      string
    >
  >
>('declencher-synchronisation.action')
