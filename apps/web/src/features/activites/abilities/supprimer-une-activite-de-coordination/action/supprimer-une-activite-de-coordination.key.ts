import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { SupprimerUneActiviteDeCoordinationValidation } from './supprimer-une-activite-de-coordination.validation'

export const SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerUneActiviteDeCoordinationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('supprimer-une-activite-de-coordination.action')
