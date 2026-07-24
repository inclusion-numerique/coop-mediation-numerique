import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { getOrCreateStructureEmployeuse } from '@app/web/server/rpc/inscription/getOrCreateStructureEmployeuse'

// L'adaptateur délègue à findOrCreateStructureAdministrative, qui garantit UNIQUEMENT la ligne
// `main.structure_administrative` (ADR-002 échange final : plus d'écriture coop) en géocodant
// l'adresse via la BAN. On neutralise l'appel réseau : searchAdresse -> null rend le géocodage
// déterministe et hors-ligne.
jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))
const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

describe('getOrCreateStructureEmployeuse', () => {
  const testSiret = '93429789600011'

  beforeAll(async () => {
    mockedSearchAdresse.mockResolvedValue(null)

    await prismaClient.structureAdministrativeMain.deleteMany({
      where: {
        siret: testSiret,
      },
    })

    // Verify the cleanup was successful
    const result = await prismaClient.structureAdministrativeMain.findFirst({
      where: {
        siret: testSiret,
      },
    })
    if (result) {
      throw new Error(
        'Structure main should have been deleted in beforeAll jest hook',
      )
    }
  })

  it('should ensure a main structure employeuse for a [Non-Diffusible] siret and be idempotent', async () => {
    const input = {
      nom: '[Non-Diffusible]',
      adresse: '[Non-Diffusible]',
      commune: 'Villeurbanne',
      codeInsee: '69266',
      typologies: undefined,
      siret: testSiret,
    }
    const result = await getOrCreateStructureEmployeuse(input)

    expect(result.mainId).toEqual(expect.any(Number))
    const { mainId } = result

    const result2 = await getOrCreateStructureEmployeuse(input)

    expect(result2.mainId).toEqual(mainId)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: {
        siret: testSiret,
      },
    })

    expect(count).toEqual(1)
  })
})
