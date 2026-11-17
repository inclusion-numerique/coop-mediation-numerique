'use server'

import { supprimerComptePorts } from '@/composition/utilisateurs/supprimer-compte.ports'
import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import {
  SUPPRIMER_COMPTE_ERRORS,
  supprimerCompte,
} from '@/features/utilisateurs/abilities/supprimer-compte'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { fromResult } from '@/libraries/nextjs'

export const supprimerMonCompteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      ({ user }) =>
        supprimerCompte({
          command: {
            cible: UtilisateurId(user.id),
            auteur: { _tag: 'titulaire' },
            maintenant: new Date(),
          },
          ports: supprimerComptePorts,
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
