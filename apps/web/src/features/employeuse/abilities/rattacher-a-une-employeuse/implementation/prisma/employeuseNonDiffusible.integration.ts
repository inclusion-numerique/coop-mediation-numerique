import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { prismaClient } from '@app/web/prismaClient'
import { ensureStructureAdministrativeMain } from './ensureStructureAdministrativeMain'

// Cas limite de production : les établissements non diffusibles, dont SIRENE ne donne ni
// dénomination ni adresse exploitables — seule la commune est sûre. La garantie doit quand même
// créer UNE ligne `main.structure_administrative`, et rester idempotente. On neutralise l'appel
// réseau : searchAdresse -> null rend le géocodage déterministe et hors-ligne.
jest.mock('@app/web/external-apis/apiAdresse', () => ({
  searchAdresse: jest.fn(),
}))
const mockedSearchAdresse = searchAdresse as jest.MockedFunction<
  typeof searchAdresse
>

describe('employeuse non diffusible', () => {
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

  it('crée une employeuse pour un SIRET [Non-Diffusible], et reste idempotente', async () => {
    const input = {
      coopId: null,
      siret: testSiret,
      identite: {
        nom: '[Non-Diffusible]',
        adresse: '[Non-Diffusible]',
        commune: 'Villeurbanne',
        codeInsee: '69266',
        codePostal: '',
      },
    }
    const result = await ensureStructureAdministrativeMain(input)

    expect(result?.id).toEqual(expect.any(Number))

    const result2 = await ensureStructureAdministrativeMain(input)

    expect(result2?.id).toEqual(result?.id)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: {
        siret: testSiret,
      },
    })

    expect(count).toEqual(1)
  })
})
