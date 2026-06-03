import type { Feature } from '@app/web/external-apis/apiAdresse'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { communeFieldsFromRdvAddress } from './communeFieldsFromRdvAddress'

jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))

const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

const evreuxFeature: Feature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [1.15, 49.02] },
  properties: {
    label: '12 Rue de la Paix 27000 Évreux',
    score: 0.9,
    housenumber: '12',
    id: '27229_xxxx_00012',
    type: 'housenumber',
    name: '12 Rue de la Paix',
    postcode: '27000',
    citycode: '27229',
    x: 0,
    y: 0,
    city: 'Évreux',
    context: '27, Eure, Normandie',
    importance: 0.5,
    street: 'Rue de la Paix',
  },
}

describe('communeFieldsFromRdvAddress', () => {
  beforeEach(() => {
    mockedSearchAdresse.mockReset()
  })

  test.each([
    null,
    undefined,
    '',
  ])('returns null and does not call the API for absent address %p', async (address) => {
    expect(await communeFieldsFromRdvAddress(address)).toBeNull()
    expect(mockedSearchAdresse).not.toHaveBeenCalled()
  })

  test('maps a BAN feature to the commune trio', async () => {
    mockedSearchAdresse.mockResolvedValue(evreuxFeature)

    expect(
      await communeFieldsFromRdvAddress('12 rue de la Paix, 27000 Évreux'),
    ).toEqual({
      commune: 'Évreux',
      communeCodePostal: '27000',
      communeCodeInsee: '27229',
    })
  })

  test('returns null when the address is not geocoded', async () => {
    mockedSearchAdresse.mockResolvedValue(null)

    expect(await communeFieldsFromRdvAddress('adresse introuvable')).toBeNull()
  })
})
