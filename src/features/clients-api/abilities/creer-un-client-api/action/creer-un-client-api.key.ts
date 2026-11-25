import type { ValeursDuClientApi } from '@/features/clients-api/action/client-api.validation'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const CREER_UN_CLIENT_API_ACTION_KEY = keyFor<
  (
    input: ValeursDuClientApi,
  ) => Promise<ServerActionResult<{ readonly clientApiId: string }, string>>
>('creer-un-client-api.action')
