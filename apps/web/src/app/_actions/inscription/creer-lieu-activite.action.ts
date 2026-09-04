'use server'

import { withAuth } from '@app/web/features/authentification'
import { CREER_LIEU_ACTIVITE_ERRORS } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import { creerLieuActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/creer-lieu-activite'
import type { CreerLieuActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/domain'
import { mediateurFromUser } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { creerLieuActivite as creerUnLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite'
import { nouveauLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite/action/depuis-la-saisie'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId as LieuUserId } from '@app/web/features/lieux-activite/domain/user-id'
import { CreerLieuActiviteValidation } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

/**
 * Jonction entre le besoin de l'inscription et l'ability qui sait créer un lieu.
 * C'est ici, et nulle part en amont, que les deux features se rencontrent : la
 * saisie devient un lieu du domaine, puis l'ability décide s'il faut le créer ou
 * rejoindre celui que la coop connaissait déjà.
 *
 * L'ability refuse un médiateur absent ; le port lui en fournit toujours un,
 * puisque le cas d'usage a résolu celui de l'acteur avant d'appeler. Cet échec
 * ne peut donc traduire qu'un invariant rompu, qu'on laisse remonter tel quel
 * plutôt que de le déguiser en erreur métier de l'inscription.
 */
const creerDansLesLieuxActivite: CreerLieuActivite = async ({
  userId,
  mediateurId,
  saisie,
}) => {
  const resultat = await creerUnLieu({
    lieu: nouveauLieu(saisie, LieuUserId(userId), new Date()),
    mediateurId: MediateurId(mediateurId),
  })

  if (!resultat.success)
    throw new Error(
      `Création du lieu refusée par l'ability : ${resultat.error._tag}`,
    )

  return resultat.data
}

export const creerLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(CreerLieuActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        creerLieuActivite({
          command: { userId: UserId(user.id), saisie: input },
          mediateurFromUser,
          creerLieuActivite: creerDansLesLieuxActivite,
        }),
      { onError: CREER_LIEU_ACTIVITE_ERRORS },
    ),
  )
