import {
  LieuIntrouvable,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import { deciderLesLieux } from './decider-les-lieux'
import type { EchecDeRenseignerLieuxActivite } from './errors'
import type { IdentifiantCartographie } from './identifiant-cartographie'
import type { LieuDesire, LieuSoumis } from './lieu-soumis'
import type { LieuxActiviteRenseignes } from './lieux-activite-renseignes'
import { lieuxDesires } from './lieux-desires'
import type { RenseignerLieuxActivitePorts } from './ports'
import { reconcilierLieuxActivite } from './reconcilier'

const identifiantsCarto = <Adresse>(
  lieux: readonly LieuDesire<Adresse>[],
): readonly IdentifiantCartographie[] =>
  lieux.flatMap(({ structureCartographieNationaleId }) =>
    structureCartographieNationaleId === null
      ? []
      : [structureCartographieNationaleId],
  )

export const renseignerLieuxActivite =
  <Adresse extends object, StructuresCarto, Destination>({
    lireLEtat,
    lireLieuxActiviteExistants,
    trouverStructuresCarto,
    planifierLesRattachements,
    enregistrerReconciliation,
  }: RenseignerLieuxActivitePorts<Adresse, StructuresCarto, Destination>) =>
  async ({
    command: { userId, lieuxActivite },
    maintenant,
  }: {
    readonly command: {
      readonly userId: UtilisateurId
      readonly lieuxActivite: readonly LieuSoumis<Adresse>[]
    }
    readonly maintenant: Date
  }): Promise<
    Result<
      LieuxActiviteRenseignes<Adresse, Destination>,
      EchecDeRenseignerLieuxActivite
    >
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

    const destinations = await planifierLesRattachements({
      lieux: aCreer,
      structuresCarto: await trouverStructuresCarto(identifiantsCarto(aCreer)),
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
