'use server'

import { withAuth } from '@app/web/features/authentification'
import { AFFICHER_RDVS_DANS_ACTIVITES_ERRORS } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.errors'
import { AfficherRdvsDansActivitesValidation } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.validation'
import { afficherRdvsDansActivites } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/implementation'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const afficherRdvsDansActivitesAction = actionBuilder()
  .use(withAuth())
  .use(withInput(AfficherRdvsDansActivitesValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        afficherRdvsDansActivites({
          utilisateurId: UtilisateurCoopId(user.id),
          afficher: input.afficher,
        }),
      { onError: AFFICHER_RDVS_DANS_ACTIVITES_ERRORS },
    ),
  )
