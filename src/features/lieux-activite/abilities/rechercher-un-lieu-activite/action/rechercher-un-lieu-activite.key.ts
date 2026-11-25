import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { LieuActiviteTrouve } from '../domain'

export const RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly LieuActiviteTrouve[], string>>
>('rechercher-un-lieu-activite.action')
