export const apiV1Url = (
  urlDeBase: string,
  path: string,
  params?: string | URLSearchParams | string[][] | Record<string, string>,
) => {
  const queryParams = params ? new URLSearchParams(params).toString() : ''

  if (queryParams.length > 0) {
    return `${urlDeBase}/api/v1${path}?${queryParams}`
  }

  return `${urlDeBase}/api/v1${path}`
}
