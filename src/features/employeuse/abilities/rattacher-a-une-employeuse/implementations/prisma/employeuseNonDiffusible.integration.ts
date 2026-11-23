import { beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { ensureStructureAdministrativeMain } from './ensureStructureAdministrativeMain'

const sansGeocodage = ensureStructureAdministrativeMain({
  geocoder: async () => null,
  signaler: () => undefined,
})

describe('employeuse non diffusible', () => {
  const testSiret = '93429789600011'

  beforeAll(async () => {
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
        'Structure main should have been deleted in beforeAll hook',
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
    const result = await sansGeocodage(input)

    expect(result?.id).toEqual(expect.any(Number))

    const result2 = await sansGeocodage(input)

    expect(result2?.id).toEqual(result?.id)

    const count = await prismaClient.structureAdministrativeMain.count({
      where: {
        siret: testSiret,
      },
    })

    expect(count).toEqual(1)
  })
})
