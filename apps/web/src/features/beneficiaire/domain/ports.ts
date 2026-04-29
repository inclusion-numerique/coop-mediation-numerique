import type { Beneficiaire } from './beneficiaire'
import type { BeneficiaireId } from './beneficiaire-id'
import type { MediateurId } from './mediateur-id'

export type GetBeneficiaireById = (
  id: BeneficiaireId,
) => Promise<Beneficiaire | null>

export type FindBeneficiairesByMediateur = (
  mediateurId: MediateurId,
) => Promise<Beneficiaire[]>
