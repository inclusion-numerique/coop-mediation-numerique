import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const SUPPRIMER_LA_COORDINATION_KEY = keyFor<
  (input: {
    readonly activiteId: string
  }) => Promise<ServerActionResult<void, string>>
>('lister-les-activites-de-coordination.supprimer')
