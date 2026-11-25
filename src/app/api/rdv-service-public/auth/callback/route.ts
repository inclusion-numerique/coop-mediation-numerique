import { type NextRequest, NextResponse } from 'next/server'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { signaler } from '@/configuration/telemetry/serveur'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/creer-ou-fusionner-depuis-usager-externe.binding'
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
import { declencherSynchronisationAvec } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/declencher-synchronisation.binding'
import { synchroniserCompteAvec } from '@/features/rdvsp/abilities/synchroniser-compte-rdv/implementations/synchroniser-compte-rdv.binding'
import { synchroniserLesOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/implementations/synchroniser-organisations.binding'
import { synchroniserLesRdvsAvec } from '@/features/rdvsp/abilities/synchroniser-rdvs/implementations/synchroniser-rdvs.binding'
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
    identifierAgent: rdvServicePublicApi({
      ...configurationRdvServicePublic(),
      onJetonsRenouveles: enregistrerLesJetons,
      jetonsCourants,
    }).identifierAgent,
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

  declencherSynchronisationAvec(
    synchroniserCompteAvec(
      synchroniserLesOrganisations,
      synchroniserLesRdvsAvec(
        creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
      ),
    ),
  )({
    demandeur: { id: utilisateurId, role: user.role },
    utilisateurId,
    seulementSansWebhook: false,
  }).catch((erreur: unknown) => signaler(erreur))

  return redirection(succes)
}
