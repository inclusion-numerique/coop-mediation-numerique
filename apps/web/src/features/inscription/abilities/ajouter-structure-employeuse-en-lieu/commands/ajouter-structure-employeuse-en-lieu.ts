import type { UserId } from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import {
  type AjouterStructureEmployeuseEnLieuError,
  EmployeuseIntrouvable,
} from '../domain'
import {
  delierStructureEmployeuseEnLieu,
  lierStructureEmployeuseEnLieu,
  lireEmployeuseActuelle,
} from '../implementation'

/**
 * Cas d'usage « la structure employeuse est-elle un lieu d'activité ? ». Étape
 * intermédiaire du parcours lieux-activité : aucune transition d'état ni
 * franchissement — le seul choix est de rattacher (Oui) ou détacher (Non) la
 * structure employeuse comme lieu. La matérialisation est entièrement infra,
 * d'où l'absence de décideur pur ; couvert en BDD.
 *
 * L'employeuse se résout depuis l'acteur : c'est ce qui rend structurel
 * l'invariant « on ne déclare que sa propre employeuse ». La recevoir en
 * paramètre reviendrait à accepter de l'appelant une décision d'autorisation.
 */
export const ajouterStructureEmployeuseEnLieu = async ({
  userId,
  estLieuActivite,
}: {
  readonly userId: UserId
  readonly estLieuActivite: boolean
}): Promise<Result<void, AjouterStructureEmployeuseEnLieuError>> => {
  const structureEmployeuseId = await lireEmployeuseActuelle(userId)

  if (structureEmployeuseId === null)
    return failure(EmployeuseIntrouvable(userId))

  if (estLieuActivite) {
    await lierStructureEmployeuseEnLieu({ userId, structureEmployeuseId })
    return success<void>(undefined)
  }

  await delierStructureEmployeuseEnLieu({ userId, structureEmployeuseId })
  return success<void>(undefined)
}
