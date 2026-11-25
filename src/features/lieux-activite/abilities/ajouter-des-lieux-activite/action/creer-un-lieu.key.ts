import type { z } from 'zod'
import type { CreerLieuActiviteValidation } from '@/features/lieux-activite/action/creer-lieu-activite.validation'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export const CREER_UN_LIEU_KEY = keyFor<
  (
    input: z.input<typeof CreerLieuActiviteValidation>,
  ) => Promise<ServerActionResult<{ readonly id: string }, string>>
>('ajouter-des-lieux-activite.creer-un-lieu')
