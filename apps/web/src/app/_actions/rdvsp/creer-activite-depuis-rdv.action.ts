'use server'

import { getAdaptiveDureeOptions } from '@app/web/features/activites/implementation/options-de-duree'
import { cheminDeSaisieDepuisUnRendezVous } from '@app/web/features/activites/ui/saisie/url-de-saisie-depuis-un-rendez-vous'
import { withAuth, withMediateur } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { CREER_ACTIVITE_DEPUIS_RDV_ERRORS } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.errors'
import { CreerActiviteDepuisRdvValidation } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.validation'
import type { PreparerUrlCreationCra } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/creer-activite-depuis-rdv'
import { MediateurRedacteurId } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/rdv-pour-activite'
import { creerActiviteDepuisRdvAvec } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/implementation/creer-activite-depuis-rdv.binding'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { getServerUrl } from '@app/web/utils/baseUrl'

const preparerUrlCreationCra: PreparerUrlCreationCra = async ({
  rendezVous,
  mediateurId,
  beneficiaires,
}) =>
  getServerUrl(
    cheminDeSaisieDepuisUnRendezVous({
      rendezVous,
      participants: beneficiaires,
      dureesProposees: await getAdaptiveDureeOptions({ mediateurId }),
    }),
    { absolutePath: true },
  )

const creerActiviteDepuisRdv = creerActiviteDepuisRdvAvec(
  preparerUrlCreationCra,
)

export const creerActiviteDepuisRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(CreerActiviteDepuisRdvValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) =>
        creerActiviteDepuisRdv({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurRedacteurId(mediateur.id),
          rdvId: input.rdvId,
        }),
      { onError: CREER_ACTIVITE_DEPUIS_RDV_ERRORS },
    ),
  )
