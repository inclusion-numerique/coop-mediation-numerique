import type { UserId } from '@app/web/features/inscription/domain'
import { type Result, success } from '@app/web/libraries/result'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import {
  renseignerLieuxActivite as deciderRenseignerLieuxActivite,
  type LieuActiviteDesire,
  type RenseignerLieuxActiviteError,
  reconcilierLieuxActivite,
  type TrouverStructuresCarto,
} from '../domain'
import {
  enregistrerReconciliation,
  getInscriptionEtat,
  lireLieuxActiviteExistants,
} from '../implementation'

/**
 * Cas d'usage « renseigner les lieux d'activité » : lit l'état, délègue la
 * décision d'état au domaine (pur, franchit l'étape), réconcilie l'ensemble des
 * lieux (pur), résout les structures carto (Entrepôt, hors transaction), puis
 * applique la réconciliation et projette l'état en une transaction. Le domaine
 * reste pur et testé par valeur ; ce use case est couvert en intégration (BDD).
 */
export const renseignerLieuxActivite = async <T extends LieuActiviteDesire>({
  command: { userId, lieuxActivite },
  trouverStructuresCarto,
  maintenant,
}: {
  readonly command: {
    readonly userId: UserId
    readonly lieuxActivite: readonly T[]
  }
  readonly trouverStructuresCarto: TrouverStructuresCarto
  readonly maintenant: Date
}): Promise<Result<void, RenseignerLieuxActiviteError>> => {
  const decision = deciderRenseignerLieuxActivite(
    await getInscriptionEtat(userId),
    userId,
    maintenant,
  )

  if (!decision.success) return decision

  const existants = await lireLieuxActiviteExistants(userId)
  const { aCloturer, aCreer } = reconcilierLieuxActivite(
    existants,
    lieuxActivite,
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
