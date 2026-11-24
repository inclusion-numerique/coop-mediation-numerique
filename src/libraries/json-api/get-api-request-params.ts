import type { NextRequest } from 'next/server'
import type { ZodError, infer as ZodInfer } from 'zod'
import type { ApiV1QueryParamsSchema } from '@/libraries/json-api/api-v1-query-params'
import { transformJsonApiQueryParamsToObject } from '@/libraries/json-api/transform-json-api-query-params-to-object'

export const getApiRequestParams = <
  QueryParamsSchema extends ApiV1QueryParamsSchema = ApiV1QueryParamsSchema,
>(
  request: NextRequest,
  queryParamsValidation: QueryParamsSchema,
):
  | { success: true; params: ZodInfer<QueryParamsSchema>; error?: undefined }
  | {
      success: false
      error: ZodError
      params?: undefined
    } => {
  const { searchParams } = request.nextUrl

  const queryParams = transformJsonApiQueryParamsToObject(searchParams)

  const parsed = queryParamsValidation.strict().safeParse(queryParams || {})

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error,
    }
  }

  return {
    success: true,
    params: parsed.data as unknown as ZodInfer<QueryParamsSchema>,
  }
}
