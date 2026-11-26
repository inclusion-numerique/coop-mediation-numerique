'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { AFFICHER_RDVS_DANS_ACTIVITES_ERRORS } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.errors'
import { AfficherRdvsDansActivitesValidation } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.validation'
import { afficherRdvsDansActivites } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/domain/afficher-rdvs-dans-activites'
import { compteRdvExiste } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/implementations/prisma/compte-rdv-existe.query'
import { enregistrerLAffichage } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/implementations/prisma/enregistrer-l-affichage.mutation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

const afficher = afficherRdvsDansActivites({
  compteRdvExiste,
  enregistrerLAffichage,
})

export const afficherRdvsDansActivitesAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(AfficherRdvsDansActivitesValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        afficher({
          utilisateurId: UtilisateurCoopId(user.id),
          afficher: input.afficher,
        }),
      { onError: AFFICHER_RDVS_DANS_ACTIVITES_ERRORS },
    ),
  )
