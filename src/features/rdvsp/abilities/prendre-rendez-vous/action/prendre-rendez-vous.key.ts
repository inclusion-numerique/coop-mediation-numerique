import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { PrendreRendezVousValidation } from './prendre-rendez-vous.validation'

export const PRENDRE_RENDEZ_VOUS_ACTION_KEY = keyFor<
  (
    input: z.input<typeof PrendreRendezVousValidation>,
  ) => Promise<ServerActionResult<{ readonly url: string }, string>>
>('prendre-rendez-vous.action')
