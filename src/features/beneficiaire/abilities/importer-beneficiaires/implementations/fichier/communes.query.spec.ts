import { describe, expect, test } from 'vitest'
import { clientDesCommunes } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/fichier/communes.query'

describe('findCommune', () => {
  describe('getCommunesClient', () => {
    test.each([
      [
        '39274',
        { codeInsee: '39274', nom: 'Lajoux', codePostal: '01410, 39310' },
      ],
      ['01082', { codeInsee: '01082', nom: 'Chanay', codePostal: '01420' }],
      ['99999', null],
    ])(
      'findCommuneByInsee(%s) should return %o',
      async (inseeCode, expectedResult) => {
        const client = await clientDesCommunes()
        const result = client.findCommuneByInsee(inseeCode)
        expect(result).toEqual(expectedResult)
      },
    )
  })
})
