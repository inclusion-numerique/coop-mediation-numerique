import { describe, expect, it } from 'vitest'
import { createTestApiV1Request } from '@/libraries/json-api/create-test-api-v1-request'
import { JsonApiCursorPaginationQueryParamsValidation } from '@/libraries/json-api/cursor-pagination'
import { getApiRequestParams } from '@/libraries/json-api/get-api-request-params'

describe('getApiRequestParams', () => {
  it('should parse query params', () => {
    const request = createTestApiV1Request({
      url: '/api/v1/archives-v1/cras?page[size]=10&page[after]=abc',
      method: 'GET',
    })

    const params = getApiRequestParams(
      request,
      JsonApiCursorPaginationQueryParamsValidation,
    )

    expect(params).toEqual({
      success: true,
      params: {
        page: {
          size: 10,
          after: 'abc',
        },
      },
    })
  })
})
