'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getServerUrl } from '@/configuration/projet/serveur'
import { urlDeSaisieDepuisUnRendezVousAvec } from '@/features/activites/implementations/prisma/url-de-saisie-depuis-un-rendez-vous.query'
import { cheminDeSaisieSelonLesDureesFrequentes } from '@/features/activites/ui/presenters/saisie/url-de-saisie-depuis-un-rendez-vous.presenter'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-ou-fusionner-depuis-usager-externe.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { CREER_ACTIVITE_DEPUIS_RDV_ERRORS } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.errors'
import { CreerActiviteDepuisRdvValidation } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.validation'
import { creerActiviteDepuisRdv } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/creer-activite-depuis-rdv'
import { creerOuFusionnerBeneficiaires } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/creer-ou-fusionner-beneficiaires'
import { MediateurRedacteurId } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/rdv-pour-activite'
import { compteDuRedacteur } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/prisma/compte-du-redacteur.query'
import { lireRdvPourActivite } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/prisma/lire-rdv-pour-activite.query'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

const creerUneActiviteDepuisUnRdv = creerActiviteDepuisRdv({
  lireRdv: lireRdvPourActivite,
  compteDuRedacteur,
  creerOuFusionnerBeneficiaires: creerOuFusionnerBeneficiaires(
    creerOuFusionnerBeneficiairesDepuisUsagersExternes({ communeDeLAdresse }),
  ),
  preparerUrlCreationCra: urlDeSaisieDepuisUnRendezVousAvec((saisie) =>
    getServerUrl(cheminDeSaisieSelonLesDureesFrequentes(saisie), {
      absolutePath: true,
    }),
  ),
})

export const creerActiviteDepuisRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(CreerActiviteDepuisRdvValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) =>
        creerUneActiviteDepuisUnRdv({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurRedacteurId(mediateur.id),
          rdvId: input.rdvId,
        }),
      { onError: CREER_ACTIVITE_DEPUIS_RDV_ERRORS },
    ),
  )
