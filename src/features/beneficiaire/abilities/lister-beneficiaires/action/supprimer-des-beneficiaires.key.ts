import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

export type SupprimerBeneficiaires = (input: {
  ids: string[]
}) => Promise<ServerActionResult<unknown>>

export const SUPPRIMER_DES_BENEFICIAIRES_KEY = keyFor<SupprimerBeneficiaires>(
  'lister-beneficiaires.supprimer-des-beneficiaires',
)
