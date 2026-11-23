import { describe, expect, it } from 'vitest'
import { JsonApiCursorPaginationQueryParamsValidation } from '@/libraries/json-api/CursorPagination'
import { createTestApiV1Request } from '@/libraries/json-api/createTestApiV1Request'
import { getApiRequestParams } from '@/libraries/json-api/getApiRequestParams'

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
