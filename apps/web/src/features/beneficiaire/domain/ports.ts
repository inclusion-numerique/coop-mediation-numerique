import type { Beneficiaire, BeneficiaireId } from './beneficiaire'
import type { BeneficiaireNotFound } from './errors'

export type GetBeneficiaireById = (
  id: BeneficiaireId,
) => Promise<Beneficiaire | null>

export type FindBeneficiairesByMediateur = (
  mediateurId: string,
) => Promise<Beneficiaire[]>
