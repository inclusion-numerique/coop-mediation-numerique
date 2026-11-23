'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { PRENDRE_RENDEZ_VOUS_ERRORS } from '@/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.errors'
import { PrendreRendezVousValidation } from '@/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.validation'
import { MediateurProprietaireId } from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import { prendreRendezVousBinding } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prendre-rendez-vous.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

export const prendreRendezVousAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(PrendreRendezVousValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) => {
        const resultat = await prendreRendezVousBinding({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurProprietaireId(mediateur.id),
          beneficiaireId: input.beneficiaireId,
        })

        // Seule l'URL de prise de rendez-vous intéresse le navigateur, qui n'a
        // qu'à s'y rendre.
        return resultat.success
          ? { success: true as const, data: { url: resultat.data.url } }
          : resultat
      },
      { onError: PRENDRE_RENDEZ_VOUS_ERRORS },
    ),
  )
