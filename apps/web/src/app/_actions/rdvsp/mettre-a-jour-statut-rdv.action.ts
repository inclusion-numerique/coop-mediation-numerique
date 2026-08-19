'use server'

import { withAuth } from '@app/web/features/authentification'
import { METTRE_A_JOUR_STATUT_RDV_ERRORS } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.errors'
import { MettreAJourStatutRdvValidation } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.validation'
import { mettreAJourStatutRdvBinding } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/mettre-a-jour-statut-rdv.binding'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const mettreAJourStatutRdvAction = actionBuilder()
  .use(withAuth())
  .use(withInput(MettreAJourStatutRdvValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        mettreAJourStatutRdvBinding({
          utilisateurId: UtilisateurCoopId(user.id),
          rdvId: input.rdvId,
          statut: input.statut,
        }),
      { onError: METTRE_A_JOUR_STATUT_RDV_ERRORS },
    ),
  )
