'use server'

import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import {
  SUPPRIMER_COMPTE_ERRORS,
  SupprimerCompteValidation,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { AuteurId, UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

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
          ports: supprimerComptePorts,
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
