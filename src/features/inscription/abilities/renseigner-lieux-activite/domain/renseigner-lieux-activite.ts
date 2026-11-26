import {
  LieuIntrouvable,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { onlyDefinedAndNotNull } from '@/libraries/collections'
import { failure, type Result, success } from '@/libraries/result'
import { deciderLesLieux } from './decider-les-lieux'
import type { EchecDeRenseignerLieuxActivite } from './errors'
import type { LieuxActiviteRenseignes } from './lieux-activite-renseignes'
import { type LieuSoumis, lieuxDesires } from './lieux-desires'
import type { RenseignerLieuxActivitePorts } from './ports'
import { reconcilierLieuxActivite } from './reconcilier'

export const renseignerLieuxActivite =
  <StructureCarto, Destination>({
    lireLEtat,
    lireLieuxActiviteExistants,
    trouverStructuresCarto,
    planifierLesRattachements,
    enregistrerReconciliation,
  }: RenseignerLieuxActivitePorts<StructureCarto, Destination>) =>
  async ({
    command: { userId, lieuxActivite },
    maintenant,
  }: {
    readonly command: {
      readonly userId: UtilisateurId
      readonly lieuxActivite: readonly LieuSoumis[]
    }
    readonly maintenant: Date
  }): Promise<
    Result<LieuxActiviteRenseignes<Destination>, EchecDeRenseignerLieuxActivite>
  > => {
    const desires = lieuxDesires(lieuxActivite)

    if (!desires.success) return desires

    const etatFranchi = deciderLesLieux({
      etat: await lireLEtat(userId),
      userId,
      maintenant,
    })

    if (!etatFranchi.success) return etatFranchi

    const { aCloturer, aCreer } = reconcilierLieuxActivite(
      await lireLieuxActiviteExistants(userId),
      desires.data,
    )

    const structuresCarto = await trouverStructuresCarto(
      aCreer
        .map(
          ({ structureCartographieNationaleId }) =>
            structureCartographieNationaleId,
        )
        .filter(onlyDefinedAndNotNull),
    )

    const destinations = await planifierLesRattachements({
      lieux: aCreer,
      structuresCarto,
      maintenant,
    })

    if (!destinations.success) return destinations

    const enregistrement = await enregistrerReconciliation({
      etatFranchi: etatFranchi.data,
      userId,
      aCloturer,
      destinations: destinations.data,
      maintenant,
    })

    if (enregistrement._tag === 'LieuDisparu')
      return failure(LieuIntrouvable(enregistrement.lieuId))

    return success({
      etatFranchi: etatFranchi.data,
      aCloturer,
      aCreer,
      destinations: destinations.data,
    })
  }
