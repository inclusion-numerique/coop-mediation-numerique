import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { OrigineDuChoix } from '../domain'

export const APPLIQUER_LES_DIFFERENCES_ACTION_KEY = keyFor<
  (input: {
    id: string
    choix: Record<string, OrigineDuChoix>
  }) => Promise<ServerActionResult<unknown, string>>
>('appliquer-les-differences.action')
