import { type NextRequest, NextResponse } from 'next/server'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { signaler } from '@/configuration/telemetry/serveur'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-ou-fusionner-depuis-usager-externe.mutation'
import {
  CODE_AUTORISATION_MANQUANT,
  CONNECTER_COMPTE_RDV_ERRORS,
} from '@/features/rdvsp/abilities/connecter-compte-rdv/action/connecter-compte-rdv.errors'
import { CodeAutorisation } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/code-autorisation'
import { connecterCompteRdv } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/connecter-compte-rdv'
import {
  type DestinationsDeRetour,
  issuesDuRetour,
  motifDiagnostic,
} from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/retour-connexion'
import { echangerCodeAutorisation } from '@/features/rdvsp/abilities/connecter-compte-rdv/implementations/api/echanger-code-autorisation.mutation'
import { redirection } from '@/features/rdvsp/abilities/connecter-compte-rdv/implementations/next/redirection.transfer'
import { compteRdvExistant } from '@/features/rdvsp/abilities/connecter-compte-rdv/implementations/prisma/compte-rdv-existant.query'
import { enregistrerCompteConnecte } from '@/features/rdvsp/abilities/connecter-compte-rdv/implementations/prisma/enregistrer-compte-connecte.mutation'
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
import { echecDefinitif } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { EmailExterne } from '@/features/rdvsp/domain/identite'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { rdvspOAuthHostname } from '@/features/rdvsp/implementations/oauth/rdvsp-oauth.client'
import {
  rdvServicePublicOAuthConfig,
  rdvServicePublicOauthCallbackUrl,
} from '@/features/rdvsp/implementations/oauth/rdvsp-oauth-callback.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/etat-encode'

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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const sessionToken = jetonDeSessionDesCookies(request.cookies)
  const user = await utilisateurDuJetonDeSession(sessionToken)

  if (!sessionToken || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const state = searchParams.get('state')

  if (!state) {
    return NextResponse.json(
      { error: 'Missing state parameter' },
      { status: 400 },
    )
  }

  const { succes, echec } = issuesDuRetour(
    decodeSerializableState(state as EncodedState<DestinationsDeRetour>, {}),
  )

  const refus = searchParams.get('error')

  if (refus) {
    return redirection(echec, {
      error: refus,
      error_description: searchParams.get('error_description') ?? '',
    })
  }

  const code = searchParams.get('code')

  if (!code) {
    return redirection(echec, CODE_AUTORISATION_MANQUANT)
  }

  const utilisateurId = UtilisateurCoopId(user.id)

  const connexion = await connecterCompteRdv({
    echangerCode: echangerCodeAutorisation({
      hostname: rdvspOAuthHostname,
      clientId: rdvServicePublicOAuthConfig.clientId,
      clientSecret:
        environnementServeur().RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
      redirectUri: rdvServicePublicOauthCallbackUrl,
    }),
    identifierAgent: rdvServicePublic.identifierAgent,
    compteExistant: compteRdvExistant,
    enregistrer: enregistrerCompteConnecte,
  })({
    utilisateurId,
    emailUtilisateur: EmailExterne(user.email),
    code: CodeAutorisation(code),
  })

  if (!connexion.success) {
    signaler(
      new Error(
        `Liaison RDV Service Public refusée : ${motifDiagnostic(connexion.error)}`,
      ),
    )

    return redirection(echec, CONNECTER_COMPTE_RDV_ERRORS[connexion.error._tag])
  }

  declencher({
    demandeur: { id: utilisateurId, role: user.role },
    utilisateurId,
    seulementSansWebhook: false,
  }).catch((erreur: unknown) => signaler(erreur))

  return redirection(succes)
}
