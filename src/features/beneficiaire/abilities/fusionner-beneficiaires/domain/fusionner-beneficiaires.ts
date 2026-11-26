import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { failure, type Result, success } from '@/libraries/result'
import {
  BeneficiaireDestinationIntrouvable,
  BeneficiaireSourceIntrouvable,
} from './errors'
import type { MergeableBeneficiaire } from './merge-beneficiaire-fields'

export type BeneficiaireAFusionner = MergeableBeneficiaire & {
  readonly creation: Date
}

export type LireLesBeneficiairesAFusionner = (cibles: {
  readonly sourceId: BeneficiaireId
  readonly destinationId: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<{
  readonly source: BeneficiaireAFusionner | null
  readonly destination: BeneficiaireAFusionner | null
}>

export type EnregistrerLaFusion = (fusion: {
  readonly sourceId: BeneficiaireId
  readonly destinationId: BeneficiaireId
  readonly source: BeneficiaireAFusionner
  readonly destination: BeneficiaireAFusionner
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}) => Promise<void>

export type FusionnerBeneficiaires = (input: {
  readonly sourceId: BeneficiaireId
  readonly destinationId: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}) => Promise<
  Result<
    { beneficiaireFusionneId: BeneficiaireId },
    BeneficiaireSourceIntrouvable | BeneficiaireDestinationIntrouvable
  >
>

export const fusionnerBeneficiaires =
  ({
    lireLesBeneficiairesAFusionner,
    enregistrerLaFusion,
  }: {
    readonly lireLesBeneficiairesAFusionner: LireLesBeneficiairesAFusionner
    readonly enregistrerLaFusion: EnregistrerLaFusion
  }): FusionnerBeneficiaires =>
  async ({ sourceId, destinationId, mediateurId, maintenant }) => {
    const { source, destination } = await lireLesBeneficiairesAFusionner({
      sourceId,
      destinationId,
      mediateurId,
    })

    if (source === null) return failure(BeneficiaireSourceIntrouvable(sourceId))
    if (destination === null)
      return failure(BeneficiaireDestinationIntrouvable(destinationId))

    await enregistrerLaFusion({
      sourceId,
      destinationId,
      source,
      destination,
      mediateurId,
      maintenant,
    })

    return success({ beneficiaireFusionneId: destinationId })
  }
