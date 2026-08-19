'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { CREER_ACTIVITE_DEPUIS_RDV_ERRORS } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.errors'
import { CreerActiviteDepuisRdvValidation } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.validation'
import { MediateurRedacteurId } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/rdv-pour-activite'
import { creerActiviteDepuisRdvBinding } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/implementation/creer-activite-depuis-rdv.binding'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const creerActiviteDepuisRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(CreerActiviteDepuisRdvValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) =>
        creerActiviteDepuisRdvBinding({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurRedacteurId(mediateur.id),
          rdvId: input.rdvId,
        }),
      { onError: CREER_ACTIVITE_DEPUIS_RDV_ERRORS },
    ),
  )
