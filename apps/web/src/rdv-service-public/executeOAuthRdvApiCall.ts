import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import {
  OAuthApiOrganisationRdvsResponse,
  OAuthRdvApiGetOrganisationsResponse,
  OauthRdvApiCreateRdvPlanInput,
  OauthRdvApiCreateRdvPlanResponse,
  OauthRdvApiGetUserResponse,
  OauthRdvApiMeResponse,
  RdvApiOrganisation,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { refreshRdvAccessToken } from '@app/web/rdv-service-public/refreshRdvAccessToken'
import { removeUndefinedValues } from '@app/web/utils/removeUndefinedValues'
import { Beneficiaire, RdvAccount } from '@prisma/client'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

export type OAuthRdvApiCredentials = Pick<
  RdvAccount,
  'accessToken' | 'refreshToken' | 'expiresAt' | 'scope'
> & { id?: number }

export type OauthRdvApiCredentialsWithOrganisations = OAuthRdvApiCredentials & {
  organisations: Pick<RdvApiOrganisation, 'id'>[]
}

/**
 * executes an API call to the rdv system using the rdvAccount's tokens,
 * handles automatic token refresh, and retries once if the first call fails
 * Pour la documentation des API RDV, voir https://rdv.anct.gouv.fr/api-docs/index.html
 */
const executeOAuthRdvApiCall = async <ResponseType = unknown>({
  rdvAccount,
  path,
  config = {},
}: {
  path: string
  rdvAccount: OAuthRdvApiCredentials
  config?: Omit<AxiosRequestConfig, 'url'>
}) => {
  // check if token is expired or about to expire
  const now = Date.now()
  const willExpireSoon =
    !!rdvAccount.expiresAt && rdvAccount.expiresAt.getTime() - now < 60_000 // <1min

  let currentAccessToken = rdvAccount.accessToken
  let accountToUse = rdvAccount

  // refresh if it's already expired or will soon expire
  if (willExpireSoon && rdvAccount.id) {
    accountToUse = await refreshRdvAccessToken({
      ...rdvAccount,
      id: rdvAccount.id,
    })
    currentAccessToken = accountToUse.accessToken
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
    return response.data
  } catch (error) {
    // if token was invalid or expired in the meantime, attempt a refresh and retry once
    if (error instanceof AxiosError) {
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
        return retryResponse.data
      }
      // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
      console.error(`RDV API ERROR FOR ENDPOINT ${path}`, error.toJSON())
    }
    // otherwise rethrow
    throw error
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
  beneficiaire,
}: {
  rdvAccount: OauthRdvApiCredentialsWithOrganisations
  beneficiaire?: Pick<Beneficiaire, 'rdvServicePublicId'>
}): Promise<OAuthApiOrganisationRdvsResponse['rdvs']> => {
  const organisationIds = rdvAccount.organisations.map(({ id }) => id)

  const rdvsPerOrganisation = await Promise.all(
    organisationIds.map((organisationId) =>
      executeOAuthRdvApiCall<OAuthApiOrganisationRdvsResponse>({
        path: `/organisations/${organisationId}/rdvs`,
        rdvAccount,
        config: {
          method: 'GET',
        },
      }),
    ),
  )

  // No filters in query param, post processing :

  const allRdvs = rdvsPerOrganisation.flatMap(({ rdvs }) => rdvs)

  console.log('ALL RDVS', allRdvs)

  const filteredRdvs = beneficiaire
    ? allRdvs.filter((rdv) =>
        rdv.participations.some(
          ({ user }) => user.id === beneficiaire.rdvServicePublicId,
        ),
      )
    : allRdvs

  console.log('filtered', filteredRdvs)

  return filteredRdvs
}

export const oAuthRdvApiGetUser = async ({
  userId,
  rdvAccount,
}: {
  userId: string // RDV Service Public user id
  rdvAccount: OAuthRdvApiCredentials
}) =>
  executeOAuthRdvApiCall<OauthRdvApiGetUserResponse>({
    path: `/users/${userId}`,
    rdvAccount,
    config: {
      method: 'GET',
    },
  })

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
