import {
  getMediateurFromDataspaceApi,
  isDataspaceApiNotFound,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

describe('dataspaceApiClient', () => {
  beforeAll(() => {
    if (ServerWebAppConfig.Dataspace.isMocked) {
      throw new Error(
        'Dataspace API is mocked, but should not be mocked in integration tests',
      )
    }
  })

  it('should return null for a test email that does not exist', async () => {
    const result = await getMediateurFromDataspaceApi({
      email: 'nonexistent.test@coop-numerique.anct.gouv.fr',
    })

    expect(isDataspaceApiNotFound(result)).toBe(true)
    expect(result).toBeNull()
  })
})
