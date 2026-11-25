import { signaler } from '@/configuration/telemetry/serveur'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-ou-fusionner-depuis-usager-externe.mutation'
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
import { noterLesWebhooksInvalides } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/webhooks-invalides.mutation'
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
import { synchroniserTousLesComptesRdv } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/domain/synchroniser-tous-les-comptes-rdv'
import { lireLesComptesRdv } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/implementations/prisma/comptes-rdv.query'
import { echecDefinitif } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { output } from '@/libraries/console'
import type { SyncRdvspDataJob } from './sync-rdvsp-data.job'

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
        reconcilierWebhooks: reconcilierWebhooks({
          api: rdvServicePublic,
          noterLesWebhooksInvalides,
        }),
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

const synchroniserTousLesComptes = synchroniserTousLesComptesRdv({
  lireLesComptes: lireLesComptesRdv,
  declencher,
})

export const executeSyncRdvspData = async (_job: SyncRdvspDataJob) => {
  const bilan = await synchroniserTousLesComptes(new Date())

  if (bilan.echecs.length > 0) {
    output(
      bilan.echecs
        .map(
          ({ utilisateurId, raison }) =>
            `Error syncing user ${utilisateurId}: ${raison}`,
        )
        .join('\n'),
    )
  }

  output(
    `Completed RDVSP sync. Synced ${bilan.synchronises}/${bilan.eligibles} eligible users out of ${bilan.comptes} with RDV account`,
  )

  return {
    totalUsers: bilan.comptes,
    eligibleUsers: bilan.eligibles,
    synced: bilan.synchronises,
  }
}
