import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { failure, type Result, success } from '@/libraries/result'
import {
  BeneficiaireDestinationIntrouvable,
  BeneficiaireSourceIntrouvable,
  type EchecDeFusionnerBeneficiaires,
} from './errors'
import type { FusionDeBeneficiaires } from './fusion-de-beneficiaires'
import { mergeBeneficiaireFields } from './merge-beneficiaire-fields'
import type { FusionnerBeneficiairesPorts } from './ports'

const laPlusAncienne = (a: Date, b: Date): Date => (a < b ? a : b)

export const fusionnerBeneficiaires =
  ({
    lireLesBeneficiairesAFusionner,
    enregistrerLaFusion,
  }: FusionnerBeneficiairesPorts) =>
  async ({
    sourceId,
    destinationId,
    mediateurId,
    maintenant,
  }: {
    readonly sourceId: BeneficiaireId
    readonly destinationId: BeneficiaireId
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<Result<FusionDeBeneficiaires, EchecDeFusionnerBeneficiaires>> => {
    const { source, destination } = await lireLesBeneficiairesAFusionner({
      sourceId,
      destinationId,
      mediateurId,
      maintenant,
    })

    if (source === null) return failure(BeneficiaireSourceIntrouvable(sourceId))
    if (destination === null)
      return failure(BeneficiaireDestinationIntrouvable(destinationId))

    const fusion: FusionDeBeneficiaires = {
      sourceId,
      destinationId,
      mediateurId,
      donneesDeLaDestination: mergeBeneficiaireFields(source, destination),
      creation: laPlusAncienne(source.creation, destination.creation),
      maintenant,
    }

    await enregistrerLaFusion(fusion)

    return success(fusion)
  }
