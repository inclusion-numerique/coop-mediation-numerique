import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

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
