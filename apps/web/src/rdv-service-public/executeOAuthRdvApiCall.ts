import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import {
  OAuthApiListMeta,
  OAuthApiOrganisationRdvsResponse,
  OAuthApiRdv,
  OAuthApiUsersResponse,
  OAuthApiWebhookEndpointsResponse,
  OAuthRdvApiGetOrganisationsResponse,
  OauthRdvApiCreateRdvPlanInput,
  OauthRdvApiCreateRdvPlanResponse,
  OauthRdvApiGetRdvsQuery,
  OauthRdvApiGetUserResponse,
  OauthRdvApiGetUsersQuery,
  OauthRdvApiGetWebhookEndpointsQuery,
  OauthRdvApiMeResponse,
  oauthRdvApiGetRdvsQueryValidation,
  oauthRdvApiGetUsersQueryValidation,
  oauthRdvApiGetWebhookEndpointsQueryValidation,
  RdvApiOrganisation,
  RdvApiUser,
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

export type OAuthRdvApiCredentialsWithId = OAuthRdvApiCredentials & {
  id: number
}

export type OauthRdvApiCredentialsWithOrganisations = OAuthRdvApiCredentials & {
  organisations: { organisationId: number }[]
}

export type OauthRdvApiResponseResult<T> =
  | {
      status: 'error' // The RDV API is unreachable or the OAUTH Tokens are invalid
      statusCode: number
      error: string
      data: undefined
    }
  | {
      status: 'ok'
      statusCode: number
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
      statusCode: (error as AxiosError).response?.status ?? 500,
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
      statusCode: response.status,
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
            statusCode: retryResponse.status,
            error: undefined,
            data: retryResponse.data,
          }
        }
      } catch (error) {
        Sentry.captureException(error)
        return {
          status: 'error',
          statusCode: (error as AxiosError).response?.status ?? 500,
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
      statusCode: (error as AxiosError).response?.status ?? 500,
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
  onlyFirstPage = false,
}: {
  rdvAccount: OAuthRdvApiCredentials
  params?: OauthRdvApiGetRdvsQuery
  onlyFirstPage?: boolean
}): Promise<OAuthApiOrganisationRdvsResponse> => {
  const queryParams = params
    ? oauthRdvApiGetRdvsQueryValidation.parse(params)
    : undefined

  return executePaginatedOauthRdvApiCall<
    'rdvs',
    OAuthApiRdv,
    OAuthApiOrganisationRdvsResponse
  >({
    rdvAccount,
    path: '/rdvs',
    config: {
      method: 'GET',
      params: queryParams,
    },
    dataKey: 'rdvs',
    onlyFirstPage,
  })
}

type PaginatedResponse<DataKey extends string, Item> = {
  meta: OAuthApiListMeta
} & { [Key in DataKey]: Item[] }

type ExecutePaginatedOauthRdvApiCallParams<
  DataKey extends string,
  Item,
  _ResponseType extends PaginatedResponse<DataKey, Item>,
> = {
  rdvAccount: OAuthRdvApiCredentials
  path: string
  config?: Omit<AxiosRequestConfig, 'url'>
  dataKey: DataKey
  onlyFirstPage?: boolean
}

export const executePaginatedOauthRdvApiCall = async <
  DataKey extends string,
  Item,
  ResponseType extends PaginatedResponse<DataKey, Item>,
>({
  rdvAccount,
  path,
  config = {},
  dataKey,
  onlyFirstPage = false,
}: ExecutePaginatedOauthRdvApiCallParams<
  DataKey,
  Item,
  ResponseType
>): Promise<ResponseType> => {
  const collectedItems: Item[] = []

  let page = 1

  const baseParams =
    config.params && typeof config.params === 'object'
      ? { ...(config.params as Record<string, unknown>) }
      : undefined

  if (baseParams && 'page' in baseParams) {
    delete (baseParams as Record<string, unknown>).page
  }

  const initialMeta: OAuthApiListMeta = {
    current_page: 0,
    next_page: null,
    prev_page: null,
    total_pages: 0,
    total_count: 0,
  }

  let lastMeta: OAuthApiListMeta = initialMeta

  while (page) {
    const pageConfig: AxiosRequestConfig = {
      ...config,
      params: {
        ...(baseParams ?? {}),
        page,
      },
    }

    const response = await executeOAuthRdvApiCall<ResponseType>({
      rdvAccount,
      path,
      config: pageConfig,
    })

    if (response.status === 'error') {
      throw new Error(response.error)
    }

    const pageItems = response.data[dataKey]
    if (Array.isArray(pageItems)) {
      collectedItems.push(...(pageItems as Item[]))
    }
    lastMeta = response.data.meta

    if (onlyFirstPage) {
      break
    }

    const nextPage = response.data.meta.next_page
    if (typeof nextPage === 'number') {
      page = nextPage
      continue
    }

    page = 0
  }

  return {
    [dataKey]: collectedItems,
    meta: lastMeta,
  } as ResponseType
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
  executePaginatedOauthRdvApiCall<
    'organisations',
    RdvApiOrganisation,
    OAuthRdvApiGetOrganisationsResponse
  >({
    path: '/organisations',
    dataKey: 'organisations',
    rdvAccount,
    config: {
      method: 'GET',
    },
  })

export const oAuthRdvApiListWebhooks = async ({
  rdvAccount,
  organisationId,
  params,
  onlyFirstPage = false,
}: {
  rdvAccount: OAuthRdvApiCredentials
  organisationId: number
  params?: OauthRdvApiGetWebhookEndpointsQuery
  onlyFirstPage?: boolean
}): Promise<OAuthApiWebhookEndpointsResponse> => {
  const queryParams = params
    ? oauthRdvApiGetWebhookEndpointsQueryValidation.parse(params)
    : undefined

  return executePaginatedOauthRdvApiCall<
    'webhook_endpoints',
    OAuthApiWebhookEndpointsResponse['webhook_endpoints'][number],
    OAuthApiWebhookEndpointsResponse
  >({
    rdvAccount,
    path: `/organisations/${organisationId}/webhook_endpoints`,
    config: {
      method: 'GET',
      params: queryParams,
    },
    dataKey: 'webhook_endpoints',
    onlyFirstPage,
  })
}

export const oAuthRdvApiCreateWebhook = async ({
  rdvAccount,
  organisationId,
  target_url,
  subscriptions,
  secret,
}: {
  rdvAccount: OAuthRdvApiCredentials
  organisationId: number
  target_url: string
  subscriptions: string[]
  secret: string
}) => {
  return executeOAuthRdvApiCall<{
    webhook_endpoint: OAuthApiWebhookEndpointsResponse['webhook_endpoints'][number]
  }>({
    path: `/organisations/${organisationId}/webhook_endpoints`,
    rdvAccount,
    config: {
      method: 'POST',
      data: {
        target_url,
        subscriptions,
        secret,
      },
    },
  })
}

export const oAuthRdvApiPatchWebhook = async ({
  rdvAccount,
  organisationId,
  webhookId,
  target_url,
  subscriptions,
  secret,
}: {
  rdvAccount: OAuthRdvApiCredentials
  organisationId: number
  webhookId: number
  target_url: string
  subscriptions: string[]
  secret: string
}) => {
  return executeOAuthRdvApiCall<{
    webhook_endpoint: OAuthApiWebhookEndpointsResponse['webhook_endpoints'][number]
  }>({
    path: `/organisations/${organisationId}/webhook_endpoints/${webhookId}`,
    rdvAccount,
    config: {
      method: 'PATCH',
      data: {
        target_url,
        subscriptions,
        secret,
      },
    },
  })
}

export const oAuthRdvApiListUsers = async ({
  rdvAccount,
  params,
  onlyFirstPage = false,
}: {
  rdvAccount: OauthRdvApiCredentialsWithOrganisations
  params?: OauthRdvApiGetUsersQuery
  onlyFirstPage?: boolean
}): Promise<OAuthApiUsersResponse> => {
  const queryParams = params
    ? oauthRdvApiGetUsersQueryValidation.parse(params)
    : undefined

  return executePaginatedOauthRdvApiCall<
    'users',
    RdvApiUser,
    OAuthApiUsersResponse
  >({
    rdvAccount,
    path: '/users',
    config: {
      method: 'GET',
      params: queryParams,
    },
    dataKey: 'users',
    onlyFirstPage,
  })
}
