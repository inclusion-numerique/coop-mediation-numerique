import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireACreer } from '@app/web/features/beneficiaire/domain/beneficiaire-a-creer'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'

export type CreerBeneficiaire = (input: {
  beneficiaire: BeneficiaireACreer
  mediateurId: MediateurId
}) => Promise<BeneficiaireIdentifie>
