'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  empreinte,
  SUPPRIMER_COMPTE_ERRORS,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { actionBuilder, fromResult } from '@app/web/libraries/nextjs'
import { chargesEffacement } from './charges-effacement'

/**
 * Suppression de son propre compte.
 *
 * La cible vient de la session et jamais de l'input : personne ne peut demander
 * la suppression d'un autre par ce chemin.
 */
export const supprimerMonCompteAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(
      ({ user }) =>
        supprimerCompte({
          command: {
            cible: UtilisateurId(user.id),
            auteur: { _tag: 'titulaire' },
            maintenant: new Date(),
          },
          charges: chargesEffacement,
          empreinte,
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
