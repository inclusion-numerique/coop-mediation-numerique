import {
  ApiV1QueryParamsSchema,
  NoQueryParamsValidation,
  NoQueryParamsValidationType,
} from '@app/web/app/api/v1/ApiV1QueryParams'
import { getApiRequestParams } from '@app/web/app/api/v1/getApiRequestParams'
import { isAuthenticatedApiClientRequest } from '@app/web/app/api/v1/isAuthenticatedApiClientRequest'
import type { ApiClientScope } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError, infer as ZodInfer } from 'zod'

/**
 * Config to create a safe (Scopes and validate query params) API route
 */
export type ApiRouteConfig = {
  scopes: ApiClientScope[]
}

/**
 * This is the type of the handler function that will be called with the query
 */
export type ApiRouteHandler<
  ResponseType,
  QueryParamsSchema extends ApiV1QueryParamsSchema,
> = (context: {
  request: NextRequest
  params: ZodInfer<QueryParamsSchema>
}) => NextResponse<ResponseType> | Promise<NextResponse<ResponseType>>

export const createHandlerWithValidation =
  <ResponseType, QueryParamsSchema extends ApiV1QueryParamsSchema>({
    queryParamsSchema,
    scopes,
  }: ApiRouteConfig & {
    queryParamsSchema: QueryParamsSchema
  }) =>
  (handler: ApiRouteHandler<ResponseType, QueryParamsSchema>) =>
  async (request: NextRequest) => {
    const isAuthenticated = await isAuthenticatedApiClientRequest(
      request,
      scopes,
    )

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsedParams = getApiRequestParams(request, queryParamsSchema)

    if (!parsedParams.success) {
      return NextResponse.json({ error: parsedParams.error }, { status: 400 })
    }

    try {
      return await handler({ request, params: parsedParams.params })
    } catch (error) {
      // return 400 if this is a ZodError
      if (error instanceof ZodError) {
        // TODO check if this is the best way to return the error message in JSON:API specs
        return NextResponse.json(
          { error: error.issues[0].message },
          { status: 400 },
        )
      }

      Sentry.captureException(error)

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      )
    }
  }

/**
 * Allow to create a safe api route with function chaining
 *
 * e.g. for a GET route without query params:
 * createApiV1Route.configure({ scopes: ['Activites'] }).handle(async (context) => {
 *   return NextResponse.json({ status: 'ok' })
 * })
 *
 * e.g. for a GET route with query params:
 * createApiV1Route.configure({ scopes: ['Activites'] })
 *   .queryParams(YourQueryParamsSchema)
 *   .handle(async ({params}) => {
 *     return NextResponse.json({ yourQueryParams: params })
 *   })
 */
export const createApiV1Route = {
  configure: <ResponseType>(config: ApiRouteConfig) => ({
    // Handler with query params validation
    queryParams: <QueryParamsSchema extends ApiV1QueryParamsSchema>(
      queryParamsSchema: QueryParamsSchema,
    ) => ({
      handle: createHandlerWithValidation<ResponseType, QueryParamsSchema>({
        ...config,
        queryParamsSchema,
      }),
    }),
    // Handler without any query params
    handle: createHandlerWithValidation<
      ResponseType,
      NoQueryParamsValidationType
    >({
      ...config,
      queryParamsSchema: NoQueryParamsValidation,
    }),
  }),
}
