import type { UserId } from '@app/web/features/inscription/domain'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { failure, type Result, success } from '@app/web/libraries/result'
import { type CreerLieuActiviteError, MediateurIntrouvable } from '../domain'
import {
  creerLieuActivite as creerLieuActiviteEnBase,
  mediateurFromUser,
} from '../implementation'

/**
 * Cas d'usage « créer un lieu d'activité pendant l'inscription ». Aucune
 * transition d'état : l'étape lieux d'activité n'est franchie que par le
 * formulaire principal, celui-ci ne fait qu'ajouter un lieu à la liste. La
 * matérialisation est entièrement infra (corrélation puis écriture), d'où
 * l'absence de décideur pur ; couvert en BDD.
 *
 * Le cas d'usage résout lui-même le médiateur de l'acteur, plutôt que de le
 * recevoir : c'est ce qui rend structurel l'invariant « on ne rattache un lieu
 * qu'à soi-même ». Le recevoir en paramètre reviendrait à accepter de
 * l'appelant une décision d'autorisation.
 */
export const creerLieuActivite = async ({
  userId,
  saisie,
}: {
  readonly userId: UserId
  readonly saisie: CreerLieuActiviteData
}): Promise<Result<{ readonly id: string }, CreerLieuActiviteError>> => {
  const mediateurId = await mediateurFromUser(userId)

  if (mediateurId === null) return failure(MediateurIntrouvable(userId))

  return success(await creerLieuActiviteEnBase({ userId, mediateurId, saisie }))
}
