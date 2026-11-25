import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { LieuxAAjouterValidation } from './ajouter-des-lieux-activite.validation'

export const AJOUTER_DES_LIEUX_ACTIVITE_ACTION_KEY = keyFor<
  (
    input: z.input<typeof LieuxAAjouterValidation>,
  ) => Promise<
    ServerActionResult<{ readonly lieux: readonly string[] }, string>
  >
>('ajouter-des-lieux-activite.action')
