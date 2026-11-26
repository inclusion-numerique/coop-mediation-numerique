'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { creerOuFusionnerDepuisUsagerExterne } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/creer-ou-fusionner-depuis-usager-externe'
import type { UsagerExterneAFusionner } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/usager-externe'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { lireLeBeneficiaireLie } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/beneficiaire-lie.query'
import { creerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/mettre-a-jour-le-beneficiaire.mutation'
import { MediateurId as MediateurDuBeneficiaire } from '@/features/beneficiaire/domain/mediateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { consulterRdvsAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/consulter-rdvs-accueil'
import type { RafraichissementAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/rafraichissement-accueil'
import { compteDuMediateur } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/donnees-accueil-rdv.query'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
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
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { rapprocherLesBeneficiaires } from '@/features/rdvsp/implementations/prisma/rapprocher-les-beneficiaires.adapter'
import { lireLesUsagersARapprocher } from '@/features/rdvsp/implementations/prisma/usagers-a-rapprocher.query'
import { fromResult } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const rdvServicePublic = rdvServicePublicApi({
  ...configurationRdvServicePublic(),
  onJetonsRenouveles: enregistrerLesJetons,
  jetonsCourants,
})

const creerOuFusionnerLesUsagers = async ({
  usagers,
  mediateurId,
}: {
  usagers: UsagerExterneAFusionner[]
  mediateurId: string
}) => {
  const fusion = await creerOuFusionnerDepuisUsagerExterne({
    lireLeBeneficiaireLie,
    trouverUnDoublon,
    communeDeLAdresse,
    mettreAJourLeBeneficiaire,
    creerLeBeneficiaire,
  })({
    usagers,
    mediateurId: MediateurDuBeneficiaire(mediateurId),
    maintenant: new Date(),
  })
  return fusion.data
}

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
      rapprocherLesBeneficiaires: rapprocherLesBeneficiaires(
        creerOuFusionnerLesUsagers,
      ),
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

/**
 * Rattrape les rendez-vous des organisations sans webhook, puis relit la
 * projection de l'accueil.
 *
 * Deux abilities sont composées ici, et non l'une dans l'autre : c'est l'écran
 * qui a besoin des deux, pas la synchronisation qui a besoin du widget (IS-1).
 * La projection est celle du rendu initial — une seule forme de part et d'autre,
 * l'union des trois états comprise : la passe peut faire basculer le compte en
 * alerte, et l'écran doit pouvoir le montrer.
 */
const consulter = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

export const rafraichirAccueilRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      async ({ user }) => {
        const utilisateurId = UtilisateurCoopId(user.id)

        const synchronisation = await declencher({
          demandeur: { id: utilisateurId, role: user.role },
          utilisateurId,
          seulementSansWebhook: true,
          maintenant: new Date(),
        })

        if (!synchronisation.success) {
          return synchronisation
        }

        // Rien n'a bougé : l'écran garde ce qu'il affiche déjà, et la lecture
        // de la projection est épargnée.
        if (synchronisation.data.derive === 0) {
          return success<RafraichissementAccueil>({ _tag: 'inchange' })
        }

        const consultation = await consulter({
          utilisateurId,
          maintenant: new Date(),
        })

        return success<RafraichissementAccueil>({
          _tag: 'rafraichi',
          derive: synchronisation.data.derive,
          widget: consultation.data.widget,
        })
      },
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
