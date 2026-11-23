'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { AFFICHER_RDVS_DANS_ACTIVITES_ERRORS } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.errors'
import { AfficherRdvsDansActivitesValidation } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.validation'
import { afficherRdvsDansActivites } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/implementations'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

export const afficherRdvsDansActivitesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
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
