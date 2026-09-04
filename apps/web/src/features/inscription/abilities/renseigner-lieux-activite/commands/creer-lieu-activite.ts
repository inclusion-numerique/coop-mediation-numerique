import type { UserId } from '@app/web/features/inscription/domain'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { failure, type Result, success } from '@app/web/libraries/result'
import {
  type CreerLieuActivite,
  type CreerLieuActiviteError,
  type MediateurFromUser,
  MediateurIntrouvable,
} from '../domain'

/**
 * Cas d'usage « créer un lieu d'activité pendant l'inscription ». Aucune
 * transition d'état : l'étape lieux d'activité n'est franchie que par le
 * formulaire principal, celui-ci ne fait qu'ajouter un lieu à la liste.
 *
 * La création elle-même appartient à `features/lieux-activite` : l'inscription
 * n'en tient pas sa propre version, elle en déclare le besoin en port et laisse
 * `app/` y brancher l'ability. C'est ce qui garantit qu'un lieu créé ici passe
 * par la même sonde de corrélation qu'ailleurs.
 *
 * Le cas d'usage résout lui-même le médiateur de l'acteur, plutôt que de le
 * recevoir : c'est ce qui rend structurel l'invariant « on ne rattache un lieu
 * qu'à soi-même ». Le recevoir en paramètre reviendrait à accepter de
 * l'appelant une décision d'autorisation.
 */
export const creerLieuActivite = async ({
  command: { userId, saisie },
  mediateurFromUser,
  creerLieuActivite: creer,
}: {
  readonly command: {
    readonly userId: UserId
    readonly saisie: CreerLieuActiviteData
  }
  readonly mediateurFromUser: MediateurFromUser
  readonly creerLieuActivite: CreerLieuActivite
}): Promise<Result<{ readonly id: string }, CreerLieuActiviteError>> => {
  const mediateurId = await mediateurFromUser(userId)

  if (mediateurId === null) return failure(MediateurIntrouvable(userId))

  return success(await creer({ userId, mediateurId, saisie }))
}
