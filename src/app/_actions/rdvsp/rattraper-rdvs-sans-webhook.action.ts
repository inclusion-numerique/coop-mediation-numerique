'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-ou-fusionner-depuis-usager-externe.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { consignerLEchec } from '@/features/rdvsp/abilities/declencher-synchronisation/domain/consigner-l-echec'
import { declencherSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/domain/declencher-synchronisation'
import { compteACible } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/compte-a-cible.query'
import { lancerSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/lancer-synchronisation.adapter'
import { marquerEchecDeSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/marquer-echec.mutation'
import { synchroniserLeCompte } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/domain/synchroniser-le-compte'
import { compteASynchroniser } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/compte-a-synchroniser.query'
import { detacherOrganisations } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/detacher-organisations.mutation'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/journal-synchronisation.mutation'
import { noterLaSynchronisationReussie } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/synchronisation-reussie.mutation'
import { reconcilierWebhooks } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/webhook/reconcilier-webhooks.adapter'
import { synchroniserOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/synchroniser-organisations'
import { appliquerPlanOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/implementations/prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/implementations/prisma/etat-organisations.query'
import { synchroniserRdvs } from '@/features/rdvsp/abilities/synchroniser-rdvs/domain/synchroniser-rdvs'
import {
  appliquerPlanLot,
  supprimerMotifsOrphelins,
  supprimerRdvs,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/prisma/appliquer-plan-lot.mutation'
import {
  etatConnuDuLot,
  rdvsDejaImportes,
} from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/prisma/etat-connu.query'
import { rapprocherBeneficiaires } from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/prisma/rapprocher-beneficiaires.adapter'
import { echecDefinitif } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { fromResult } from '@/libraries/nextjs'

const rdvServicePublic = rdvServicePublicApi({
  ...configurationRdvServicePublic(),
  onJetonsRenouveles: enregistrerLesJetons,
  jetonsCourants,
})

const declencher = consignerLEchec(
  declencherSynchronisation({
    compteACible,
    lancer: lancerSynchronisation(
      synchroniserLeCompte({
        lireLeCompte: compteASynchroniser,
        reconcilierOrganisations: synchroniserOrganisations({
          listerOrganisations: rdvServicePublic.listerOrganisations,
          etatOrganisations,
          appliquerPlan: appliquerPlanOrganisations,
        }),
        reconcilierLesRdvsDuMediateur: ({ mediateurId, journaliser }) =>
          synchroniserRdvs({
            listerRdvs: rdvServicePublic.listerRdvs,
            rdvsDejaImportes,
            etatConnuDuLot,
            appliquerPlan: appliquerPlanLot,
            supprimerRdvs,
            supprimerMotifsOrphelins,
            rapprocherBeneficiaires: rapprocherBeneficiaires({
              mediateurId,
              creerOuFusionner:
                creerOuFusionnerBeneficiairesDepuisUsagersExternes({
                  communeDeLAdresse,
                }),
              journaliser,
            }),
          }),
        reconcilierWebhooks: reconcilierWebhooks(rdvServicePublic),
        detacherOrganisations,
        ouvrirJournal,
        cloturerJournal,
        echouerJournal,
        noterLaSynchronisationReussie,
      }),
    ),
    signaler,
    echecDefinitif,
  }),
  marquerEchecDeSynchronisation(),
)

/**
 * Rattrapage au chargement d'un écran, pour son propre compte : seules les
 * organisations dont le webhook n'a pas pu être posé sont parcourues, les autres
 * arrivant par notification.
 *
 * `derive` vaut zéro quand rien n'a bougé — c'est ce qui dispense l'écran de se
 * rafraîchir.
 */
export const rattraperRdvsSansWebhookAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      async ({ user }) =>
        declencher({
          demandeur: { id: UtilisateurCoopId(user.id), role: user.role },
          utilisateurId: UtilisateurCoopId(user.id),
          seulementSansWebhook: true,
        }),
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
