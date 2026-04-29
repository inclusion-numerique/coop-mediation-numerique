import type { Result } from '@app/web/libraries/result'
import type { Beneficiaire } from './beneficiaire'
import type { BeneficiaireId } from './beneficiaire-id'
import type { AucunBeneficiaireValide } from './errors'
import type { MediateurId } from './mediateur-id'

export type GetBeneficiaireById = (
  id: BeneficiaireId,
) => Promise<Beneficiaire | null>

export type FindBeneficiairesByMediateur = (
  mediateurId: MediateurId,
) => Promise<Beneficiaire[]>

export type SupprimerBeneficiaires = (input: {
  ids: readonly BeneficiaireId[]
  mediateurId: MediateurId
}) => Promise<Result<{ deleted: number }, AucunBeneficiaireValide>>
