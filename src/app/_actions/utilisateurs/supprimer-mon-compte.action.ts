'use server'

import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import {
  SUPPRIMER_COMPTE_ERRORS,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { fromResult } from '@app/web/libraries/nextjs'

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
