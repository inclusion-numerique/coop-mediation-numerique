import type { UserId } from '@/features/inscription/domain'
import { onlyDefinedAndNotNull } from '@/libraries/collections/onlyDefinedAndNotNull'
import { type Result, success } from '@/libraries/result'
import {
  renseignerLieuxActivite as deciderRenseignerLieuxActivite,
  type LieuActiviteInput,
  type LireLieuxActiviteExistants,
  type RenseignerLieuxActiviteError,
  reconcilierLieuxActivite,
  type TrouverStructuresCarto,
} from '../domain'
import {
  enregistrerReconciliation,
  getInscriptionEtat,
} from '../implementation'
import type { RattacherAuLieuDesire } from '../implementation/prisma/enregistrer-reconciliation.mutation'

/**
 * Cas d'usage « renseigner les lieux d'activité » : lit l'état, délègue la
 * décision d'état au domaine (pur, franchit l'étape), réconcilie l'ensemble des
 * lieux (pur), résout les structures carto (Entrepôt, hors transaction), puis
 * applique la réconciliation et projette l'état en une transaction. Le domaine
 * reste pur et testé par valeur ; ce use case est couvert en intégration (BDD).
 */
export const renseignerLieuxActivite = async <StructureCarto>({
  command: { userId, lieuxActivite },
  trouverStructuresCarto,
  lireLieuxActiviteExistants,
  rattacherAuLieuDesire,
  maintenant,
}: {
  readonly command: {
    readonly userId: UserId
    readonly lieuxActivite: readonly LieuActiviteInput[]
  }
  readonly trouverStructuresCarto: TrouverStructuresCarto<StructureCarto>
  readonly lireLieuxActiviteExistants: LireLieuxActiviteExistants
  readonly rattacherAuLieuDesire: RattacherAuLieuDesire<StructureCarto>
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

  await enregistrerReconciliation(rattacherAuLieuDesire)({
    etatFranchi: decision.data.etatFranchi,
    userId,
    aCloturer,
    aCreer,
    structuresCarto,
  })

  return success<void>(undefined)
}
