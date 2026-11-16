import { expect } from 'vitest'
export const expectV1ApiResponse = async (
  response: Response,
  options?: {
    status?: number
    data?: unknown
  },
) => {
  expect(response.headers.get('content-type')).toBe('application/json')

  const status = options?.status ?? 200
  expect(response.status).toBe(status)

  const json = await response.json()

  expect(json).toEqual(options?.data)
}

export const expect403ApiResponse = (response: Response) =>
  expectV1ApiResponse(response, {
    status: 403,
    data: { error: 'Forbidden' },
  })
