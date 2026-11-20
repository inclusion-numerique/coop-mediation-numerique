import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { LieuxAAjouterValidation } from '../action/ajouter-des-lieux-activite.validation'

export const ENREGISTRER_LA_SELECTION_DE_LIEUX_KEY = keyFor<
  (
    input: z.input<typeof LieuxAAjouterValidation>,
  ) => Promise<ServerActionResult<unknown, string>>
>('ajouter-des-lieux-activite.enregistrer-la-selection')
