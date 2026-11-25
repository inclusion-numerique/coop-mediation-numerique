'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-ou-fusionner-depuis-usager-externe.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { consulterRdvsAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/consulter-rdvs-accueil'
import type { RafraichissementAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/rafraichissement-accueil'
import { compteDuMediateur } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/implementations/prisma/donnees-accueil-rdv.query'
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
import { success } from '@/libraries/result'

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
        })

        if (!synchronisation.success) {
          return synchronisation
        }

        // Rien n'a bougé : l'écran garde ce qu'il affiche déjà, et la lecture
        // de la projection est épargnée.
        if (synchronisation.data.derive === 0) {
          return success<RafraichissementAccueil>({ _tag: 'inchange' })
        }

        return success<RafraichissementAccueil>({
          _tag: 'rafraichi',
          derive: synchronisation.data.derive,
          widget: await consulter({ utilisateurId, maintenant: new Date() }),
        })
      },
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
