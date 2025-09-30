import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import {
  OAuthApiOrganisationRdvsResponse,
  OAuthApiRdv,
  OAuthApiRdvsResponse,
  OAuthRdvApiGetOrganisationsResponse,
  OauthRdvApiCreateRdvPlanInput,
  OauthRdvApiCreateRdvPlanResponse,
  OauthRdvApiGetRdvsQuery,
  OauthRdvApiGetUserResponse,
  OauthRdvApiMeResponse,
  RdvApiOrganisation,
  RdvApiUser,
  oauthRdvApiGetRdvsQueryValidation,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { refreshRdvAccessToken } from '@app/web/rdv-service-public/refreshRdvAccessToken'
import { removeUndefinedValues } from '@app/web/utils/removeUndefinedValues'
import type { RdvAccount } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export type OAuthRdvApiCredentials = Pick<
  RdvAccount,
  'accessToken' | 'refreshToken' | 'expiresAt' | 'scope'
> & { id?: number }

export type OauthRdvApiCredentialsWithOrganisations = OAuthRdvApiCredentials & {
  organisations: Pick<RdvApiOrganisation, 'id'>[]
}

export type OauthRdvApiResponseResult<T> =
  | {
      status: 'error' // The RDV API is unreachable or the OAUTH Tokens are invalid
      error: string
      data: undefined
    }
  | {
      status: 'ok'
      error: undefined
      data: T
    }

/**
 * executes an API call to the rdv system using the rdvAccount's tokens,
 * handles automatic token refresh, and retries once if the first call fails
 * Pour la documentation des API RDV, voir https://rdv.anct.gouv.fr/api-docs/index.html
 */
export const executeOAuthRdvApiCall = async <ResponseType = unknown>({
  rdvAccount,
  path,
  config = {},
}: {
  path: string
  rdvAccount: OAuthRdvApiCredentials
  config?: Omit<AxiosRequestConfig, 'url'>
}): Promise<OauthRdvApiResponseResult<ResponseType>> => {
  // check if token is expired or about to expire
  const now = Date.now()
  const willExpireSoon =
    !!rdvAccount.expiresAt && rdvAccount.expiresAt.getTime() - now < 60_000 // <1min

  let currentAccessToken = rdvAccount.accessToken
  let accountToUse = rdvAccount

  try {
    // refresh if it's already expired or will soon expire
    if (willExpireSoon && rdvAccount.id) {
      accountToUse = await refreshRdvAccessToken({
        ...rdvAccount,
        id: rdvAccount.id,
      })
      currentAccessToken = accountToUse.accessToken
    }
  } catch (error) {
    Sentry.captureException(error)
    // We could not refresh token (service down or oauth revoked)
    return {
      status: 'error',
      error:
        'message' in (error as AxiosError)
          ? (error as AxiosError).message
          : 'An error occurred while calling the RDV API',
      data: undefined,
    }
  }

  const requestConfig: AxiosRequestConfig = {
    ...config,
    url: `https://${PublicWebAppConfig.RdvServicePublic.OAuth.hostname}/api/v1${path}`,
    headers: {
      Authorization: `Bearer ${currentAccessToken}`,
      ...config.headers,
    },
    data: config.data ? removeUndefinedValues(config.data) : undefined,
  }

  try {
    // first attempt
    const response = await axios<ResponseType>(requestConfig)
    return {
      status: 'ok',
      error: undefined,
      data: response.data,
    }
  } catch (error) {
    // if token was invalid or expired in the meantime, attempt a refresh and retry once
    if (error instanceof AxiosError) {
      try {
        const status = error.response?.status
        // typical invalid token scenario: 401
        if (status === 401 && rdvAccount.id) {
          // refresh and retry once
          const updated = await refreshRdvAccessToken({
            ...accountToUse,
            id: rdvAccount.id,
          })
          const retryConfig: AxiosRequestConfig = {
            ...requestConfig,
            headers: {
              ...requestConfig.headers,
              Authorization: `Bearer ${updated.accessToken}`,
            },
          }
          const retryResponse = await axios<ResponseType>(retryConfig)
          return {
            status: 'ok',
            error: undefined,
            data: retryResponse.data,
          }
        }
      } catch (error) {
        Sentry.captureException(error)
        return {
          status: 'error',
          error:
            'message' in (error as AxiosError)
              ? (error as AxiosError).message
              : 'An error occurred while calling the RDV API',
          data: undefined,
        }
      }
    }

    // otherwise sentry log the error and return an error response
    Sentry.captureException(error)
    return {
      status: 'error',
      error:
        'message' in (error as AxiosError)
          ? (error as AxiosError).message
          : 'An error occurred while calling the RDV API',
      data: undefined,
    }
  }
}

export const oAuthRdvApiCreateRdvPlan = async ({
  input,
  rdvAccount,
}: {
  input: OauthRdvApiCreateRdvPlanInput
  rdvAccount: OAuthRdvApiCredentials
}) => {
  return executeOAuthRdvApiCall<OauthRdvApiCreateRdvPlanResponse>({
    path: '/rdv_plans',
    rdvAccount,
    config: {
      method: 'POST',
      data: input,
    },
  })
}

export const oAuthRdvApiListRdvs = async ({
  rdvAccount,
  params,
}: {
  rdvAccount: OauthRdvApiCredentialsWithOrganisations
  params?: OauthRdvApiGetRdvsQuery
}): Promise<OAuthApiOrganisationRdvsResponse['rdvs']> => {
  const rdvs: OAuthApiRdv[] = []

  let page = 1

  const baseParams = params
    ? oauthRdvApiGetRdvsQueryValidation.parse(params)
    : undefined

  while (page) {
    const response = await executeOAuthRdvApiCall<OAuthApiRdvsResponse>({
      path: `/rdvs`,
      rdvAccount,
      config: {
        method: 'GET',
        params: {
          ...baseParams,
          page,
        },
      },
    })
    if (response.status === 'error') {
      return []
    }
    const nextPage = response.data.meta.next_page
    rdvs.push(...response.data.rdvs)
    if (typeof nextPage === 'number') {
      page = nextPage
    } else if (typeof nextPage === 'string') {
      const parsed = Number(nextPage)
      page = Number.isFinite(parsed) ? parsed : 0
    } else {
      page = 0
    }
  }

  return rdvs
}

export const oAuthRdvApiGetUser = async ({
  userId,
  rdvAccount,
}: {
  userId: string // RDV Service Public user id
  rdvAccount: OAuthRdvApiCredentials
}): Promise<OauthRdvApiResponseResult<OauthRdvApiGetUserResponse>> =>
  executeOAuthRdvApiCall<OauthRdvApiGetUserResponse>({
    path: `/users/${userId}`,
    rdvAccount,
    config: {
      method: 'GET',
    },
  })

export const oAuthRdvApiGetUserById = async ({
  userId,
  rdvAccount,
}: {
  userId: number
  rdvAccount: OAuthRdvApiCredentials
}): Promise<RdvApiUser | null> => {
  const response = await oAuthRdvApiGetUser({
    userId: String(userId),
    rdvAccount,
  })
  if (response.status === 'error') {
    return null
  }
  return response.data.user
}

export const oAuthRdvApiMe = async ({
  rdvAccount,
}: {
  rdvAccount: OAuthRdvApiCredentials
}) =>
  executeOAuthRdvApiCall<OauthRdvApiMeResponse>({
    path: '/agents/me',
    rdvAccount,
    config: {
      method: 'GET',
    },
  })

export const oAuthRdvApiGetOrganisations = async ({
  rdvAccount,
}: {
  rdvAccount: OAuthRdvApiCredentials
}) =>
  executeOAuthRdvApiCall<OAuthRdvApiGetOrganisationsResponse>({
    path: '/organisations',
    rdvAccount,
    config: {
      method: 'GET',
    },
  })
