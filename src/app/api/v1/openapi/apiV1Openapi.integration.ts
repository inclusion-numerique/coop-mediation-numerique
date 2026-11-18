import { describe, expect, it } from 'vitest'
import { createTestApiV1Request } from '@/libraries/json-api/createTestApiV1Request'
import { expectV1ApiResponse } from '@/libraries/json-api/expectV1ApiResponse'
import { GET } from './route'

describe('api v1 /openapi', () => {
  it('returns api specs even if not authenticated', async () => {
    const response = GET(
      createTestApiV1Request({
        url: '/api/v1/openapi',
        method: 'GET',
      }),
    )

    await expectV1ApiResponse(response, {
      data: expect.objectContaining({
        openapi: '3.0.0',
        info: expect.objectContaining({
          title: 'La coop - API',
        }),
      }),
    })
  })
})
