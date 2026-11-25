import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const SUPPRIMER_LA_COORDINATION_KEY = keyFor<
  (input: {
    readonly activiteId: string
  }) => Promise<ServerActionResult<void, string>>
>('lister-les-activites-de-coordination.supprimer')
