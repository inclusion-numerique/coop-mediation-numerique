import { type NextRequest, NextResponse } from 'next/server'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { signaler } from '@/configuration/telemetry/serveur'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { creerOuFusionnerDepuisUsagerExterne } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/domain/creer-ou-fusionner-depuis-usager-externe'
import { communeDeLAdresse } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/commune-de-l-adresse.query'
import { lireLeBeneficiaireLie } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/beneficiaire-lie.query'
import { creerLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/creer-le-beneficiaire.mutation'
import { trouverUnDoublon } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/doublon-de-l-usager.query'
import { mettreAJourLeBeneficiaire } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/prisma/mettre-a-jour-le-beneficiaire.mutation'
import { signalerLesUsagersEcartes } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/telemetrie/usagers-ecartes.adapter'
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
import { lireLesUsagersARapprocher } from '@/features/rdvsp/implementations/prisma/usagers-a-rapprocher.query'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/etat-encode'

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

const creerOuFusionnerLesUsagers = (
  demande: Parameters<typeof fusionnerLesUsagers>[0],
) => fusionnerLesUsagers(demande).then(signalerLesUsagersEcartes)

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
    maintenant: new Date(),
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
    maintenant: new Date(),
  }).catch((erreur: unknown) => signaler(erreur))

  return redirection(succes)
}
