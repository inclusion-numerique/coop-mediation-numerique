import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Result } from '@app/web/libraries/result'
import type { AucunBeneficiaireValide } from './errors'

export type SupprimerBeneficiaires = (input: {
  ids: readonly BeneficiaireId[]
  mediateurId: MediateurId
}) => Promise<Result<{ deleted: number }, AucunBeneficiaireValide>>
