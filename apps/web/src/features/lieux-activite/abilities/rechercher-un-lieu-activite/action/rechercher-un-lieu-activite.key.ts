import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { LieuActiviteTrouve } from '../implementation'

export const RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY = keyFor<
  (input: {
    recherche: string
  }) => Promise<ServerActionResult<readonly LieuActiviteTrouve[], string>>
>('rechercher-un-lieu-activite.action')
