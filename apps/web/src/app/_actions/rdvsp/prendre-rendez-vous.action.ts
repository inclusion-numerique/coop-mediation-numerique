'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { PRENDRE_RENDEZ_VOUS_ERRORS } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.errors'
import { PrendreRendezVousValidation } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.validation'
import { MediateurProprietaireId } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import { prendreRendezVousBinding } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prendre-rendez-vous.binding'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const prendreRendezVousAction = actionBuilder()
  .use(withAuth())
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
