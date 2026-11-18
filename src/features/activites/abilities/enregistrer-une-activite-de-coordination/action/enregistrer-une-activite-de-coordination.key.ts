import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { ActiviteEnregistree } from '../domain'
import type { EnregistrerUneActiviteDeCoordinationValidation } from './enregistrer-une-activite-de-coordination.validation'

export const ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY = keyFor<
  (
    input: z.input<typeof EnregistrerUneActiviteDeCoordinationValidation>,
  ) => Promise<ServerActionResult<ActiviteEnregistree, string>>
>('enregistrer-une-activite-de-coordination.action')
