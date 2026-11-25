import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { SupprimerBeneficiairesValidation } from './supprimer-beneficiaires.validation'

export const SUPPRIMER_BENEFICIAIRES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerBeneficiairesValidation>,
  ) => Promise<ServerActionResult<{ readonly deleted: number }, string>>
>('supprimer-beneficiaires.action')
