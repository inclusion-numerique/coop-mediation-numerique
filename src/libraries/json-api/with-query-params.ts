import { type NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'
import type { ApiV1QueryParamsSchema } from '@/libraries/json-api/api-v1-query-params'
import { getApiRequestParams } from '@/libraries/json-api/get-api-request-params'

export const withQueryParams =
  <Schema extends ApiV1QueryParamsSchema>(schema: Schema) =>
  async (
    _ctx: object,
    request: NextRequest,
  ): Promise<{ ctx: { queryParams: z.infer<Schema> } } | NextResponse> => {
    const parsed = getApiRequestParams(request, schema)

    return parsed.success
      ? { ctx: { queryParams: parsed.params } }
      : NextResponse.json({ error: parsed.error }, { status: 400 })
  }
