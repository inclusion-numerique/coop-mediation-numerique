'use server'

import { supprimerComptePorts } from '@/composition/utilisateurs/supprimer-compte.ports'
import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import {
  SUPPRIMER_COMPTE_ERRORS,
  SupprimerCompteValidation,
  supprimerCompte,
} from '@/features/utilisateurs/abilities/supprimer-compte'
import { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

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
