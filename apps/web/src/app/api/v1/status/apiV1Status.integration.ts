import { createTestApiV1Request } from '@app/web/app/api/v1/createTestApiV1Request'
import { apiV1Version } from '@app/web/app/api/v1/apiV1Version'
import {
  expect403ApiResponse,
  expectV1ApiResponse,
} from '@app/web/app/api/v1/expectV1ApiResponse'
import {
  createTestApiClientWithScopes,
  testApiClient,
} from '@app/web/app/api/v1/testApiClient'
import { GET } from './route'

describe('api v1 /status', () => {
  beforeAll(async () => {
    await createTestApiClientWithScopes({
      scopes: [],
    })
  })

  it('403 on invalid api key', async () => {
    const response = await GET(
      createTestApiV1Request({
        url: '/api/v1/status',
        method: 'GET',
      }),
    )

    await expect403ApiResponse(response)
  })

  it('returns status', async () => {
    const response = await GET(
      createTestApiV1Request({
        url: '/api/v1/status',
        method: 'GET',
        client: testApiClient,
      }),
    )

    await expectV1ApiResponse(response, {
      data: {
        status: 'ok',
        version: apiV1Version,
      },
    })
  })
})
