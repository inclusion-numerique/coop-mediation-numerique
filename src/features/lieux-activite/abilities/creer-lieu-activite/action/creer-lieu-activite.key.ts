import type { z } from 'zod'
import type { CreerLieuActiviteValidation } from '@/features/lieux-activite/action/creer-lieu-activite.validation'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'

export const CREER_UN_LIEU_ACTIVITE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof CreerLieuActiviteValidation>,
  ) => Promise<ServerActionResult<{ readonly id: string }, string>>
>('creer-lieu-activite.action')
