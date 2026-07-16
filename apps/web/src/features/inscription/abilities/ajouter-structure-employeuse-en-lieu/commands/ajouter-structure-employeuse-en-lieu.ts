import type { UserId } from '@app/web/features/inscription/domain'
import type { StructureId } from '../domain'
import {
  delierStructureEmployeuseEnLieu,
  lierStructureEmployeuseEnLieu,
} from '../implementation'

/**
 * Cas d'usage « la structure employeuse est-elle un lieu d'activité ? ». Étape
 * intermédiaire du parcours lieux-activité : aucune transition d'état ni
 * franchissement — le seul choix est de rattacher (Oui) ou détacher (Non) la
 * structure employeuse comme lieu. Toute la logique est infra (matérialisation
 * + rattachement), d'où l'absence de décideur pur ; couvert en BDD.
 */
export const ajouterStructureEmployeuseEnLieu = async ({
  userId,
  structureEmployeuseId,
  estLieuActivite,
}: {
  readonly userId: UserId
  readonly structureEmployeuseId: StructureId
  readonly estLieuActivite: boolean
}): Promise<void> => {
  if (estLieuActivite) {
    await lierStructureEmployeuseEnLieu({ userId, structureEmployeuseId })
    return
  }

  await delierStructureEmployeuseEnLieu({ userId, structureEmployeuseId })
}
