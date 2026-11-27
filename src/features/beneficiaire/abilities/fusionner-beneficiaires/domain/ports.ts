import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireAFusionner } from './beneficiaire-a-fusionner'
import type { FusionDeBeneficiaires } from './fusion-de-beneficiaires'

export type LireLesBeneficiairesAFusionner = (cibles: {
  readonly sourceId: BeneficiaireId
  readonly destinationId: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}) => Promise<{
  readonly source: BeneficiaireAFusionner | null
  readonly destination: BeneficiaireAFusionner | null
}>

export type EnregistrerLaFusion = (
  fusion: FusionDeBeneficiaires,
) => Promise<void>

export type FusionnerBeneficiairesPorts = {
  readonly lireLesBeneficiairesAFusionner: LireLesBeneficiairesAFusionner
  readonly enregistrerLaFusion: EnregistrerLaFusion
}
