import type { Beneficiaire } from '../beneficiaire'
import type { BeneficiaireId } from '../beneficiaire-id'

export type GetBeneficiaireById = (
  id: BeneficiaireId,
) => Promise<Beneficiaire | null>
