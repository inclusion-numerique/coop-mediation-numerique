import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { QuitterUneEquipeValidation } from './quitter-une-equipe.validation'

export const QUITTER_UNE_EQUIPE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof QuitterUneEquipeValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('quitter-une-equipe.action')
