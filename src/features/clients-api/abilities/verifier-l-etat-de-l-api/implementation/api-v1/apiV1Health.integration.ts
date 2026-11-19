import { beforeAll, describe, it } from 'vitest'
import { GET } from '@/app/api/v1/health/route'
import {
  createTestApiClientWithScopes,
  testApiClient,
} from '@/features/clients-api/fixtures/testApiClient'
import { createTestApiV1Request } from '@/libraries/json-api/createTestApiV1Request'
import {
  expect403ApiResponse,
  expectV1ApiResponse,
} from '@/libraries/json-api/expectV1ApiResponse'

describe('api v1 /health', () => {
  beforeAll(async () => {
    await createTestApiClientWithScopes({
      scopes: [],
    })
  })

  it('403 on invalid api key', async () => {
    const response = await GET(
      createTestApiV1Request({
        url: '/api/v1/health',
        method: 'GET',
      }),
    )

    await expect403ApiResponse(response)
  })

  it('returns status', async () => {
    const response = await GET(
      createTestApiV1Request({
        url: '/api/v1/health',
        method: 'GET',
        client: testApiClient,
      }),
    )

    await expectV1ApiResponse(response, {
      data: {
        status: 'ok',
      },
    })
  })
})
