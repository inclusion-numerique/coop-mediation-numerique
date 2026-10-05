import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { keyFor } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { CreerActiviteDepuisRdvValidation } from './creer-activite-depuis-rdv.validation'

export const CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY = keyFor<
  (
    input: z.input<typeof CreerActiviteDepuisRdvValidation>,
  ) => Promise<ServerActionResult<{ readonly urlCreationCra: string }, string>>
>('creer-activite-depuis-rdv.action')
