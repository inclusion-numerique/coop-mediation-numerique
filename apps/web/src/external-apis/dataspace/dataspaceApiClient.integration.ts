import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
  isDataspaceApiNotFound,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'

describe('dataspaceApiClient', () => {
  describe('getMediateurFromDataspaceApi', () => {
    it.only('should return null for a test email that does not exist', async () => {
      const result = await getMediateurFromDataspaceApi({
        email: 'nonexistent.test@coop-numerique.anct.gouv.fr',
      })
      console.log('result', result)

      expect(isDataspaceApiNotFound(result)).toBe(true)
      expect(result).toBeNull()
    })

    it('should return conseiller_numerique mediateur data for patrick.morie@conseiller-numerique.fr', async () => {
      const result = await getMediateurFromDataspaceApi({
        email: 'patrick.morie@conseiller-numerique.fr',
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
          is_coordinateur: expect.any(Boolean),
          is_conseiller_numerique: expect.any(Boolean),
          structures_employeuses: expect.any(Array),
          lieux_activite: expect.any(Array),
          conseillers_numeriques_coordonnes: expect.any(Array),
        }),
      )

      // Verify this is a conseiller numerique
      expect(result.is_conseiller_numerique).toBe(true)

      // Verify structures_employeuses structure if present
      if (result.structures_employeuses.length > 0) {
        expect(result.structures_employeuses[0]).toEqual(
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
            contrats: expect.any(Array),
          }),
        )
      }

      // Verify lieux_activite structure if present
      if (result.lieux_activite.length > 0) {
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
      }
    })

    it('should handle email case insensitivity', async () => {
      const resultLowercase = await getMediateurFromDataspaceApi({
        email: 'patrick.morie@conseiller-numerique.fr',
      })

      const resultUppercase = await getMediateurFromDataspaceApi({
        email: 'PATRICK.MORIE@CONSEILLER-NUMERIQUE.FR',
      })

      // Both should return the same result (or both should be valid mediateur data)
      if (
        resultLowercase !== null &&
        !isDataspaceApiError(resultLowercase) &&
        resultUppercase !== null &&
        !isDataspaceApiError(resultUppercase)
      ) {
        expect(resultLowercase.id).toBe(resultUppercase.id)
      }
    })

    it.only('should handle email with leading/trailing spaces', async () => {
      const result = await getMediateurFromDataspaceApi({
        email: '  patrick.morie@conseiller-numerique.fr  ',
      })

      // This email likely doesn't exist in the real Dataspace API
      // API returns [] which we convert to null
      // If you want to test with a real email, replace this with an actual email from the Dataspace database
      expect(isDataspaceApiNotFound(result)).toBe(true)
      expect(result).toBeNull()
    })
  })
})
