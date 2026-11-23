'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { METTRE_A_JOUR_STATUT_RDV_ERRORS } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.errors'
import { MettreAJourStatutRdvValidation } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.validation'
import { mettreAJourStatutRdvBinding } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/mettre-a-jour-statut-rdv.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

export const mettreAJourStatutRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
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
