import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import {
  getSessionUserFromId,
  getSessionUserFromSessionToken,
} from '@app/web/auth/getSessionUserFromSessionToken'
import { CodeAutorisation } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/domain/code-autorisation'
import type { ErreurConnexionCompte } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/domain/connecter-compte-rdv'
import { echangerCodeAutorisation } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/api/echanger-code-autorisation'
import { connecterCompteRdv } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/connecter-compte-rdv'
import { compteRdvExistant } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/prisma/compte-rdv-existant.query'
import { enregistrerCompteConnecte } from '@app/web/features/rdvsp/abilities/connecter-compte-rdv/implementation/prisma/enregistrer-compte-connecte.mutation'
import { EmailExterne } from '@app/web/features/rdvsp/domain/identite'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { rdvServicePublicApiBinding } from '@app/web/features/rdvsp/implementation/rdv-service-public.bindings'
import { syncAllRdvData } from '@app/web/features/rdvsp/sync/syncAllRdvData'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import {
  rdvServicePublicOAuthConfig,
  rdvServicePublicOauthCallbackUrl,
} from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { getServerUrl } from '@app/web/utils/baseUrl'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const connecter = connecterCompteRdv({
  echangerCode: echangerCodeAutorisation({
    hostname: PublicWebAppConfig.RdvServicePublic.OAuth.hostname,
    clientId: rdvServicePublicOAuthConfig.clientId,
    clientSecret: ServerWebAppConfig.RdvServicePublic.OAuth.clientSecret,
    redirectUri: rdvServicePublicOauthCallbackUrl,
  }),
  identifierAgent: rdvServicePublicApiBinding.identifierAgent,
  compteExistant: compteRdvExistant,
  enregistrer: enregistrerCompteConnecte,
})

/**
 * Chaque échec de liaison porte désormais son propre code : la route ne fait plus
 * que traduire l'erreur du domaine en redirection, là où tout finissait
 * auparavant en `server_error` dès qu'une exception traversait le `try`.
 */
const REDIRECTIONS_ERREUR: Record<
  ErreurConnexionCompte['_tag'],
  { error: string; error_description: string }
> = {
  CodeAutorisationRefuse: {
    error: 'invalid_oauth_code',
    error_description: 'Le code d’autorisation est invalide ou a expiré',
  },
  EmailAgentDifferent: {
    error: 'account_does_not_match_email',
    error_description:
      'Le compte RDV Service Public ne correspond pas à l’adresse email du compte de La coop',
  },
  JetonRevoque: {
    error: 'invalid_oauth_account',
    error_description:
      'Impossible de récupérer l’identifiant de l’utilisateur RDV Service Public',
  },
  CompteNonLie: {
    error: 'invalid_oauth_account',
    error_description:
      'Impossible de récupérer l’identifiant de l’utilisateur RDV Service Public',
  },
  ApiIndisponible: {
    error: 'api_error',
    error_description: 'RDV Service Public n’a pas pu être contacté',
  },
  ReponseInattendue: {
    error: 'api_error',
    error_description: 'RDV Service Public a renvoyé une réponse inattendue',
  },
  RdvIntrouvable: {
    error: 'api_error',
    error_description: 'RDV Service Public a renvoyé une réponse inattendue',
  },
}

const createErrorRedirectionFunction =
  (redirectToError: string) => (queryParams?: Record<string, string>) => {
    const urlSearchParams = new URLSearchParams(queryParams)

    return NextResponse.redirect(
      getServerUrl(`${redirectToError}?${urlSearchParams.toString()}`, {
        absolutePath: true,
      }),
    )
  }

/**
 * Route de retour du parcours OAuth de RDV Service Public.
 *
 * Elle est réduite à ses responsabilités de route : authentifier la session,
 * lire les paramètres de l'URL, déléguer la liaison à l'ability
 * `connecter-compte-rdv`, puis rediriger. L'échange de jetons, l'identification
 * de l'agent, le contrôle d'adresse et l'écriture du compte vivent désormais
 * dans la feature.
 */
export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!sessionToken || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  if (!state) {
    return NextResponse.json(
      { error: 'Missing state parameter' },
      { status: 400 },
    )
  }

  const decodedState = decodeSerializableState(
    state as EncodedState<{
      redirectToSuccess?: string
      redirectToError?: string
    }>,
    {},
  )

  const successCallbackUrl = decodedState.redirectToSuccess ?? '/coop'
  const errorCallbackUrl = decodedState.redirectToError ?? '/coop'

  const redirectToError = createErrorRedirectionFunction(errorCallbackUrl)

  const error = request.nextUrl.searchParams.get('error') || ''
  const error_description =
    request.nextUrl.searchParams.get('error_description') || ''

  if (error) {
    return redirectToError({ error, error_description })
  }

  if (!code) {
    return redirectToError({
      error: 'invalid_oauth_code',
      error_description: 'Le code d’autorisation est manquant',
    })
  }

  const connexion = await connecter({
    utilisateurId: UtilisateurCoopId(user.id),
    emailUtilisateur: EmailExterne(user.email),
    code: CodeAutorisation(code),
  })

  if (!connexion.success) {
    Sentry.captureException?.(
      new Error(`Liaison RDV Service Public refusée : ${connexion.error._tag}`),
    )
    return redirectToError(REDIRECTIONS_ERREUR[connexion.error._tag])
  }

  const updatedUserWithRdvAccount = await getSessionUserFromId(user.id)

  if (!updatedUserWithRdvAccount.rdvAccount) {
    Sentry.captureException?.(
      new Error('No RDV account found after OAuth callback'),
    )
    return redirectToError({
      error: 'server_error',
      error_description: 'Une erreur est survenue lors de la connexion',
    })
  }

  // Synchronisation en tâche de fond : elle peut durer, l'utilisateur n'a pas à
  // l'attendre pour être redirigé.
  syncAllRdvData({
    user: {
      ...updatedUserWithRdvAccount,
      rdvAccount: updatedUserWithRdvAccount.rdvAccount,
    },
  }).catch((syncError) => {
    Sentry.captureException?.(syncError)
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error(
      'Error while synchronizing RDV account data for user ',
      user.id,
      user.email,
      syncError,
    )
  })

  return NextResponse.redirect(
    getServerUrl(successCallbackUrl, { absolutePath: true }),
  )
}
