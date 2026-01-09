import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
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

  it('coordinateur - should return conseiller_numerique coordinateur data as conum: false', async () => {
    const result = await getMediateurFromDataspaceApi({
      email: 'a.chretien@sommenumerique.fr',
    })

    // Verify it's not an error or null
    expect(isDataspaceApiError(result)).toBe(false)
    expect(isDataspaceApiNotFound(result)).toBe(false)
    expect(result).not.toBeNull()

    // Type guard to access mediateur properties
    if (result === null || isDataspaceApiError(result)) {
      throw new Error('Expected mediateur data but got null or error')
    }

    // Verify mediateur structure
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        is_coordinateur: true,
        is_conseiller_numerique: false,
        structures_employeuses: expect.any(Array),
        lieux_activite: expect.any(Array),
        conseillers_numeriques_coordonnes: expect.any(Array),
      }),
    )

    expect(result.structures_employeuses.length).toBeGreaterThan(0)
    expect(result.structures_employeuses[0]).toEqual(
      expect.objectContaining({
        nom: expect.any(String),
        siret: expect.any(String),
        ids: expect.objectContaining({
          coop: expect.any(String),
          dataspace: expect.any(Number),
          pg_id: expect.any(Number),
        }),
        adresse: expect.objectContaining({
          nom_voie: expect.any(String),
          code_insee: expect.any(String),
          code_postal: expect.any(String),
          nom_commune: expect.any(String),
        }),
      }),
    )

    expect(result.lieux_activite[0]).toEqual(
      expect.objectContaining({
        nom: expect.any(String),
        siret: expect.any(String),
        adresse: expect.objectContaining({
          nom_voie: expect.any(String),
          code_insee: expect.any(String),
          code_postal: expect.any(String),
          nom_commune: expect.any(String),
          numero_voie: expect.any(Number),
        }),
      }),
    )
  })

  it('conseiller numerique - should handle email case insensitivity', async () => {
    const resultLowercase = await getMediateurFromDataspaceApi({
      email: 'a.gibout@ai-stefi.fr',
    })

    const resultUppercase = await getMediateurFromDataspaceApi({
      email: 'A.GIBOUT@AI-STEFI.FR',
    })

    // Both should return the same result (or both should be valid mediateur data)
    expect(resultLowercase).not.toBeNull()
    expect(resultUppercase).not.toBeNull()
    expect(isDataspaceApiError(resultLowercase)).toBe(false)
    expect(isDataspaceApiError(resultUppercase)).toBe(false)

    if (
      isDataspaceApiError(resultLowercase) ||
      isDataspaceApiError(resultUppercase)
    ) {
      throw new Error('Expected mediateur data but got error')
    }

    expect(resultLowercase?.is_conseiller_numerique).toBe(true)
    expect(resultLowercase?.is_coordinateur).toBe(false)

    expect(resultLowercase).toEqual(resultUppercase)
  })
})
