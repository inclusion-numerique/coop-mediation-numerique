import type { UtilisateurId } from '@/features/inscription/domain'
import { onlyDefinedAndNotNull } from '@/libraries/collections'
import { type Result, success } from '@/libraries/result'
import { deciderLesLieux } from './decider-les-lieux'
import type { EchecDeRenseignerLieuxActivite } from './errors'
import type { LieuxActiviteRenseignes } from './lieux-activite-renseignes'
import { type LieuSoumis, lieuxDesires } from './lieux-desires'
import type { RenseignerLieuxActivitePorts } from './ports'
import { reconcilierLieuxActivite } from './reconcilier'

export const renseignerLieuxActivite =
  <StructureCarto>({
    lireLEtat,
    lireLieuxActiviteExistants,
    trouverStructuresCarto,
    enregistrerReconciliation,
  }: RenseignerLieuxActivitePorts<StructureCarto>) =>
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
    Result<LieuxActiviteRenseignes, EchecDeRenseignerLieuxActivite>
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

    await enregistrerReconciliation({
      etatFranchi: etatFranchi.data,
      userId,
      aCloturer,
      aCreer,
      structuresCarto,
      maintenant,
    })

    return success({ etatFranchi: etatFranchi.data, aCloturer, aCreer })
  }
