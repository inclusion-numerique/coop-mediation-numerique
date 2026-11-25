import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { RetirerUnMediateurDuLieuValidation } from './retirer-un-mediateur-du-lieu.validation'

export const RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY = keyFor<
  (
    input: z.input<typeof RetirerUnMediateurDuLieuValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('retirer-un-mediateur-du-lieu.action')
