import type { ApiV1QueryParamsSchema } from '@app/web/app/api/v1/ApiV1QueryParams'
import { getApiRequestParams } from '@app/web/app/api/v1/getApiRequestParams'
import { type NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

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
