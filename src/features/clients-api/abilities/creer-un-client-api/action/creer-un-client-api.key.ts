import type { ValeursDuClientApi } from '@/features/clients-api/formulaire'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libs/injection/client'

export const CREER_UN_CLIENT_API_ACTION_KEY = keyFor<
  (
    input: ValeursDuClientApi,
  ) => Promise<ServerActionResult<{ readonly clientApiId: string }, string>>
>('creer-un-client-api.action')
