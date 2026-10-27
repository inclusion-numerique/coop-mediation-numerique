import type { ValeursDuClientApi } from '@app/web/features/clients-api/formulaire'
import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'

export const CREER_UN_CLIENT_API_ACTION_KEY = keyFor<
  (
    input: ValeursDuClientApi,
  ) => Promise<ServerActionResult<{ readonly clientApiId: string }, string>>
>('creer-un-client-api.action')
