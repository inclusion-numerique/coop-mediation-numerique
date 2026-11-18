import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Result } from '@/libraries/result'
import type { AucunBeneficiaireValide } from './errors'

export type SupprimerBeneficiaires = (input: {
  ids: readonly BeneficiaireId[]
  mediateurId: MediateurId
}) => Promise<Result<{ deleted: number }, AucunBeneficiaireValide>>
