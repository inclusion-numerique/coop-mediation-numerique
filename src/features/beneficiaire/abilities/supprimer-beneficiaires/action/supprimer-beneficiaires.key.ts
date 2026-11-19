import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { SupprimerBeneficiairesValidation } from './supprimer-beneficiaires.validation'

export const SUPPRIMER_BENEFICIAIRES_ACTION_KEY = keyFor<
  (
    input: z.input<typeof SupprimerBeneficiairesValidation>,
  ) => Promise<ServerActionResult<{ readonly deleted: number }, string>>
>('supprimer-beneficiaires.action')
