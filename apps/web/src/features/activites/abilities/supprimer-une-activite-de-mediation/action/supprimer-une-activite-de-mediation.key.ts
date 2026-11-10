import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { SupprimerUneActiviteDeMediationValidation } from './supprimer-une-activite-de-mediation.validation'

export const SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerUneActiviteDeMediationValidation>,
  ) => Promise<ServerActionResult<void, string>>
>('supprimer-une-activite-de-mediation.action')
