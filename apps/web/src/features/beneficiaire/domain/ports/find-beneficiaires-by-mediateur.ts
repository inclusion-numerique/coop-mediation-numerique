import type { Beneficiaire } from '../beneficiaire'
import type { MediateurId } from '../mediateur-id'

export type FindBeneficiairesByMediateur = (
  mediateurId: MediateurId,
) => Promise<Beneficiaire[]>
