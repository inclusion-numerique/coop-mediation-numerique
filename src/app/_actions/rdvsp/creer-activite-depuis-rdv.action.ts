'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getServerUrl } from '@/configuration/projet/serveur'
import { urlDeSaisieDepuisUnRendezVousAvec } from '@/features/activites/implementations/prisma/url-de-saisie-depuis-un-rendez-vous.query'
import { cheminDeSaisieSelonLesDureesFrequentes } from '@/features/activites/ui/presenters/saisie/url-de-saisie-depuis-un-rendez-vous.presenter'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { creerOuFusionnerDepuisUsagerExterne } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/creer-ou-fusionner-depuis-usager-externe'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { lireLeBeneficiaireLie } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/beneficiaire-lie.query'
import { creerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/mettre-a-jour-le-beneficiaire.mutation'
import { signalerLesUsagersEcartes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/telemetrie/usagers-ecartes.adapter'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { CREER_ACTIVITE_DEPUIS_RDV_ERRORS } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.errors'
import { CreerActiviteDepuisRdvValidation } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.validation'
import { creerActiviteDepuisRdv } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/creer-activite-depuis-rdv'
import { compteDuRedacteur } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/prisma/compte-du-redacteur.query'
import { lireRdvPourActivite } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/prisma/lire-rdv-pour-activite.query'
import { MediateurId } from '@/features/rdvsp/domain/identifiants/mediateur-id'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const fusionnerLesUsagers = creerOuFusionnerDepuisUsagerExterne({
  lireLeBeneficiaireLie,
  trouverUnDoublon,
  communeDeLAdresse,
  mettreAJourLeBeneficiaire,
  creerLeBeneficiaire,
})

const creerOuFusionnerLesUsagers = (
  demande: Parameters<typeof fusionnerLesUsagers>[0],
) => fusionnerLesUsagers(demande).then(signalerLesUsagersEcartes)

const creerUneActiviteDepuisUnRdv = creerActiviteDepuisRdv({
  lireRdv: lireRdvPourActivite,
  compteDuRedacteur,
  creerOuFusionnerBeneficiaires: creerOuFusionnerLesUsagers,
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
      async ({ user, mediateur, input }) => {
        const preparation = await creerUneActiviteDepuisUnRdv({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurId(mediateur.id),
          rdvId: input.rdvId,
          maintenant: new Date(),
        })

        return preparation.success
          ? success({ urlCreationCra: preparation.data.urlCreationCra })
          : preparation
      },
      { onError: CREER_ACTIVITE_DEPUIS_RDV_ERRORS },
    ),
  )
