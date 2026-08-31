'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import {
  empreinte,
  SUPPRIMER_COMPTE_ERRORS,
  SupprimerCompteValidation,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { AuteurId, UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { chargesEffacement } from './charges-effacement'

/**
 * Suppression d'un compte par un administrateur.
 *
 * L'auteur est distinct de la cible, et leurs identifiants portent des marques
 * différentes : intervertir les deux ne compile pas.
 */
export const supprimerCompteAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(SupprimerCompteValidation))
  .execute(
    fromResult(
      ({ input, user }) =>
        supprimerCompte({
          command: {
            cible: UtilisateurId(input.utilisateurId),
            auteur: {
              _tag: 'administrateur',
              administrateurId: AuteurId(user.id),
            },
            maintenant: new Date(),
          },
          charges: chargesEffacement,
          empreinte,
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
