import type { UtilisateurId } from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import { onlyDefinedAndNotNull } from '@/libraries/collections'
import { type Result, success } from '@/libraries/result'
import type { AdresseNonValidee } from './adresse-non-validee'
import {
  deciderLesLieux,
  type RenseignerLieuxActiviteError,
} from './decider-les-lieux'
import { type LieuSoumis, lieuxDesires } from './lieux-desires'
import type {
  EnregistrerReconciliation,
  LireLieuxActiviteExistants,
  TrouverStructuresCarto,
} from './ports'
import { reconcilierLieuxActivite } from './reconcilier'

export type RenseignerLieuxActivitePorts<StructureCarto> = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly lireLieuxActiviteExistants: LireLieuxActiviteExistants
  readonly trouverStructuresCarto: TrouverStructuresCarto<StructureCarto>
  readonly enregistrerReconciliation: EnregistrerReconciliation<StructureCarto>
}

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
    Result<void, RenseignerLieuxActiviteError | AdresseNonValidee>
  > => {
    const desires = lieuxDesires(lieuxActivite)

    if (!desires.success) return desires

    const decision = deciderLesLieux(
      await lireLEtat(userId),
      userId,
      maintenant,
    )

    if (!decision.success) return decision

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
      etatFranchi: decision.data.etatFranchi,
      userId,
      aCloturer,
      aCreer,
      structuresCarto,
    })

    return success<void>(undefined)
  }
