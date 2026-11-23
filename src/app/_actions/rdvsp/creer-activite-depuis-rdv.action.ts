'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { urlDeSaisieDepuisUnRendezVous } from '@/features/activites/implementations/url-de-saisie-depuis-un-rendez-vous'
import { withAuth, withMediateur } from '@/features/authentification'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe'
import { withMaintenance } from '@/features/maintenance-mode'
import { CREER_ACTIVITE_DEPUIS_RDV_ERRORS } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.errors'
import { CreerActiviteDepuisRdvValidation } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.validation'
import { MediateurRedacteurId } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/rdv-pour-activite'
import { creerActiviteDepuisRdvAvec } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/creer-activite-depuis-rdv.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

const creerActiviteDepuisRdv = creerActiviteDepuisRdvAvec(
  urlDeSaisieDepuisUnRendezVous,
  creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
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
