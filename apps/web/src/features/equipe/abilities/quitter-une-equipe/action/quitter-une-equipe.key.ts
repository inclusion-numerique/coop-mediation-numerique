import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { QuitterUneEquipeValidation } from './quitter-une-equipe.validation'

export const QUITTER_UNE_EQUIPE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof QuitterUneEquipeValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('quitter-une-equipe.action')
