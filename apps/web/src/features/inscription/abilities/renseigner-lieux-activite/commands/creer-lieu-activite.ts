import type { UserId } from '@app/web/features/inscription/domain'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { failure, type Result, success } from '@app/web/libraries/result'
import { type CreerLieuActiviteError, MediateurIntrouvable } from '../domain'
import { creerLieuActivite as creerLieuActiviteEnBase } from '../implementation'

/**
 * Cas d'usage « créer un lieu d'activité pendant l'inscription ». Aucune
 * transition d'état : l'étape lieux d'activité n'est franchie que par le
 * formulaire principal, celui-ci ne fait qu'ajouter un lieu à la liste. Toute la
 * logique est infra (corrélation puis matérialisation), d'où l'absence de
 * décideur pur ; couvert en BDD.
 */
export const creerLieuActivite = async ({
  userId,
  mediateurId,
  saisie,
}: {
  readonly userId: UserId
  readonly mediateurId: string | null
  readonly saisie: CreerLieuActiviteData
}): Promise<Result<{ readonly id: string }, CreerLieuActiviteError>> => {
  if (mediateurId === null) return failure(MediateurIntrouvable(userId))

  return success(await creerLieuActiviteEnBase({ userId, mediateurId, saisie }))
}
