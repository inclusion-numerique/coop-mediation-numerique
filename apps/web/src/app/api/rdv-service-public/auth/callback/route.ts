import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { prismaClient } from '@app/web/prismaClient'
import { oAuthRdvApiMe } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import {
  rdvServicePublicOAuthConfig,
  rdvServicePublicOAuthTokenEndpoint,
} from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { getServerUrl } from '@app/web/utils/baseUrl'
import {
  EncodedState,
  decodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type OAuthTokenResponse = {
  access_token: string // Jeton d'accès pour les requêtes API
  refresh_token?: string // Jeton pour rafraîchir l'accès
  expires_in: number // Durée de validité en secondes
  token_type: string // Type de jeton, généralement "Bearer"
  scope?: string // Scopes accordés
}

/**
 * This is the OAuth callback url route where rdv redirects to after the user has logged in.
 * It is used to get the user's tokens and update his RdvAccount.
 *
 * The User RDV Account should already exists and be created (id) before the oauth flow.
 *
 */
export const GET = async (request: NextRequest) => {
  // Fetch the user

  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!sessionToken || !user) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  // I should have code and state (for the code workflow)
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json(
      { error: 'Missing code or state parameter' },
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

  const redirectToSuccess = decodedState.redirectToSuccess ?? '/coop'
  const redirectToError = decodedState.redirectToError ?? '/coop'

  try {
    // Échanger `code` contre access/refresh tokens.
    const tokenResponse = await axios.post<OAuthTokenResponse>(
      rdvServicePublicOAuthTokenEndpoint,
      new URLSearchParams({
        client_id: rdvServicePublicOAuthConfig.clientId,
        client_secret: ServerWebAppConfig.RdvServicePublic.OAuth.clientSecret,
        redirect_uri: rdvServicePublicOAuthConfig.redirectUri,
        code,
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    )
    const tokens = tokenResponse.data

    const authUserData = {
      accessToken: tokens.access_token ?? '',
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      scope: tokens.scope ?? '',
      metadata: {},
    }

    console.log('TOKEN RESPONSE', tokenResponse.data)
    console.log('authuserdata', authUserData)

    const userData = await oAuthRdvApiMe({
      rdvAccount: authUserData,
    })
    console.log('userData from oauth', userData.agent)

    if (!userData.agent?.id) {
      throw new Error('userData.agent.id is undefined from /api/me response')
    }

    // Update the rdv account
    await prismaClient.rdvAccount.upsert({
      where: { id: userData.agent.id },
      create: {
        ...authUserData,
        id: userData.agent.id,
        userId: user.id,
      },
      update: {
        ...authUserData,
      },
      select: {
        id: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
      },
    })

    // Rediriger vers une route de succès ou une page front.

    return NextResponse.redirect(
      getServerUrl(redirectToSuccess, { absolutePath: true }),
    )
  } catch (error) {
    Sentry.captureException(error)
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error('Error while connecting to RDV Service Public', error)
    return NextResponse.redirect(
      getServerUrl(redirectToError, { absolutePath: true }),
    )
  }
}
