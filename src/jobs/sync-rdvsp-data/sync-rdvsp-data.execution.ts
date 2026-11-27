import { signaler } from '@/configuration/telemetry/serveur'
import { creerOuFusionnerDepuisUsagerExterne } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/creer-ou-fusionner-depuis-usager-externe'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { lireLeBeneficiaireLie } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/beneficiaire-lie.query'
import { creerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/mettre-a-jour-le-beneficiaire.mutation'
import { demandeSignalee } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/rdv-service-public/demande-signalee.adapter'
import type { DemandeDUsagersExternes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/rdv-service-public/usager-externe.transfer'
import { signalerLesUsagersEcartes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/telemetrie/usagers-ecartes.adapter'
import { declencherSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/domain/declencher-synchronisation'
import { compteACible } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/prisma/marquer-echec.mutation'
import { synchroniserCompteRdv } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/domain/synchroniser-compte-rdv'
import { detacherOrganisations } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/detacher-organisations.mutation'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/journal-synchronisation.mutation'
import { noterLaSynchronisationReussie } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/synchronisation-reussie.mutation'
import { noterLesWebhooksInvalides } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/prisma/webhooks-invalides.mutation'
import { destinationDesWebhooksJoignable } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/webhook/destination-des-webhooks.query'
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
import { synchroniserTousLesComptesRdv } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/domain/synchroniser-tous-les-comptes-rdv'
import { lireLesComptesRdv } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/implementations/prisma/comptes-rdv.query'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { lireLesUsagersARapprocher } from '@/features/rdvsp/implementations/prisma/usagers-a-rapprocher.query'
import { output } from '@/libraries/console'
import type { SyncRdvspDataJob } from './sync-rdvsp-data.job'

const rdvServicePublic = rdvServicePublicApi({
  ...configurationRdvServicePublic(),
  onJetonsRenouveles: enregistrerLesJetons,
  jetonsCourants,
})

const fusionnerLesUsagers = creerOuFusionnerDepuisUsagerExterne({
  lireLeBeneficiaireLie,
  trouverUnDoublon,
  communeDeLAdresse,
  mettreAJourLeBeneficiaire,
  creerLeBeneficiaire,
})

const creerOuFusionnerLesUsagers = (demande: DemandeDUsagersExternes) =>
  fusionnerLesUsagers(demandeSignalee(demande)).then(signalerLesUsagersEcartes)

const declencher = declencherSynchronisation({
  compteACible,
  synchroniser: synchroniserCompteRdv({
    reconcilierOrganisations: synchroniserOrganisations({
      listerOrganisations: rdvServicePublic.listerOrganisations,
      etatOrganisations,
      appliquerPlan: appliquerPlanOrganisations,
    }),
    reconcilierRdvs: synchroniserRdvs({
      listerRdvs: rdvServicePublic.listerRdvs,
      rdvsDejaImportes,
      etatConnuDuLot,
      appliquerPlan: appliquerPlanLot,
      supprimerRdvs,
      supprimerMotifsOrphelins,
      lireLesUsagersARapprocher,
      rapprocherLesBeneficiaires: creerOuFusionnerLesUsagers,
    }),
    listerWebhooksDeLaCoop: rdvServicePublic.listerWebhooksDeLaCoop,
    poserWebhook: rdvServicePublic.poserWebhook,
    relireWebhooksDeLaCoop: rdvServicePublic.listerWebhooksDeLaCoop,
    reconfigurerWebhook: rdvServicePublic.reconfigurerWebhook,
    destinationDesWebhooksJoignable,
    noterLesWebhooksInvalides,
    detacherOrganisations,
    ouvrirJournal,
    cloturerJournal,
    echouerJournal,
    noterLaSynchronisationReussie,
  }),
  marquerEchec: marquerEchecDeSynchronisation,
  signaler,
})

const synchroniserTousLesComptes = synchroniserTousLesComptesRdv({
  lireLesComptes: lireLesComptesRdv,
  declencher,
})

export const executeSyncRdvspData = async (_job: SyncRdvspDataJob) => {
  const synchronisation = await synchroniserTousLesComptes({
    maintenant: new Date(),
  })

  const bilan = synchronisation.data

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
