import type { Feature } from '@app/web/external-apis/apiAdresse'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { findOrCreateStructure } from './findOrCreateStructure'

jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))

jest.mock('@app/web/prismaClient', () => ({
  prismaClient: {
    structure: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>
const structure = prismaClient.structure as unknown as {
  findFirst: jest.Mock
  findMany: jest.Mock
  create: jest.Mock
  update: jest.Mock
}
// BAN feature whose citycode (codeInsee) is the geocoded, canonical value.
const featureWithCitycode = (citycode: string): Feature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-0.77, 48.07] },
  properties: {
    label: '1 Place du Général de Gaulle 53000 Laval',
    score: 0.9,
    housenumber: '1',
    id: `${citycode}_xxxx_00001`,
    type: 'housenumber',
    name: '1 Place du Général de Gaulle',
    postcode: '53000',
    citycode,
    x: 0,
    y: 0,
    city: 'Laval',
    context: '53, Mayenne, Pays de la Loire',
    importance: 0.5,
    street: 'Place du Général de Gaulle',
  },
})

const mayenne = {
  siret: '22530001100015',
  nom: 'DEPARTEMENT DE LA MAYENNE',
  adresse: '1 Place du Général de Gaulle',
  codePostal: '53000',
  commune: 'LAVAL',
}

describe('findOrCreateStructure', () => {
  beforeEach(() => {
    mockedSearchAdresse.mockReset()
    structure.findFirst.mockReset().mockResolvedValue(null)
    structure.findMany.mockReset().mockResolvedValue([])
    structure.create.mockReset().mockResolvedValue({ id: 'created-id' })
    structure.update.mockReset().mockResolvedValue(undefined)
  })

  test('matches an existing structure when the payload codeInsee diverges from the geocoded one', async () => {
    // Payload carries the siège codeInsee (53130); BAN resolves the real one (53000).
    mockedSearchAdresse.mockResolvedValue(featureWithCitycode('53000'))
    structure.findFirst.mockResolvedValueOnce({
      id: 'existing-mayenne',
      suppression: null,
    })

    const result = await findOrCreateStructure({
      ...mayenne,
      codeInsee: '53130',
    })

    expect(result.id).toBe('existing-mayenne')
    // The lookup must use the resolved (geocoded) codeInsee, not the payload one.
    expect(structure.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          siret: mayenne.siret,
          codeInsee: '53000',
          suppression: null,
        }),
      }),
    )
    expect(structure.create).not.toHaveBeenCalled()
  })

  test('creates from the geocoded address (single BAN call) when nothing matches', async () => {
    mockedSearchAdresse.mockResolvedValue(featureWithCitycode('53000'))

    await findOrCreateStructure({ ...mayenne, codeInsee: '53130' })

    expect(mockedSearchAdresse).toHaveBeenCalledTimes(1)
    expect(structure.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codeInsee: '53000',
          latitude: 48.07,
          longitude: -0.77,
        }),
      }),
    )
  })

  test('falls back to the raw codeInsee when geocoding returns nothing', async () => {
    mockedSearchAdresse.mockResolvedValue(null)

    await findOrCreateStructure({ ...mayenne, codeInsee: '53130' })

    expect(structure.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codeInsee: '53130' }),
      }),
    )
  })

  test('ignores a geocoding that lands in a different département (DOM mis-geocoding)', async () => {
    // A Martinique (972xx) address mis-geocoded by BAN to Gironde (33xxx).
    mockedSearchAdresse.mockResolvedValue(featureWithCitycode('33324'))

    await findOrCreateStructure({
      siret: '24972005300084',
      nom: 'Communaute Agglomeration Espace Sud',
      adresse: 'Rue case',
      codePostal: '97228',
      commune: 'Sainte-Luce',
      codeInsee: '97221',
    })

    // Lookup keeps the raw payload codeInsee, not the mis-geocoded one.
    expect(structure.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ codeInsee: '97221' }),
      }),
    )
    // Create stores the raw codeInsee (not the Gironde one) and no BAN coords.
    expect(structure.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codeInsee: '97221' }),
      }),
    )
    const createArg = structure.create.mock.calls[0][0]
    expect(createArg.data).not.toHaveProperty('latitude')
  })

  test('short-circuits on coopId without geocoding', async () => {
    structure.findFirst.mockResolvedValueOnce({
      id: 'coop-id',
      suppression: null,
    })

    const result = await findOrCreateStructure({
      ...mayenne,
      coopId: 'coop-id',
      codeInsee: '53130',
    })

    expect(result.id).toBe('coop-id')
    expect(mockedSearchAdresse).not.toHaveBeenCalled()
    expect(structure.create).not.toHaveBeenCalled()
  })

  test('matches by nom + resolved codeInsee when there is no SIRET', async () => {
    mockedSearchAdresse.mockResolvedValue(featureWithCitycode('53000'))
    structure.findFirst.mockResolvedValueOnce({
      id: 'existing-by-nom',
      suppression: null,
    })

    const result = await findOrCreateStructure({
      ...mayenne,
      siret: null,
      codeInsee: '53130',
    })

    expect(result.id).toBe('existing-by-nom')
    expect(structure.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nom: mayenne.nom,
          codeInsee: '53000',
        }),
      }),
    )
    expect(structure.create).not.toHaveBeenCalled()
  })
})
