import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { Siret } from '@/libraries/insee'
import { lireLesEmployeusesDuSiret } from './employeuses-du-siret.query'

describe('lire les employeuses d’un SIRET', () => {
  const siret = '99999999999998'
  const state = { antenneId: 0, sireneId: 0 }

  beforeAll(async () => {
    const antenne = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret,
        denominationAntenne: 'Antenne de Rennes',
        denominationSirene: 'Association des tests',
      },
      select: { id: true },
    })
    const sirene = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret,
        denominationAntenne: null,
        denominationSirene: 'Employeuse nommée par SIRENE',
      },
      select: { id: true },
    })
    state.antenneId = antenne.id
    state.sireneId = sirene.id
  })

  afterAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
  })

  it('rend toutes les lignes du SIRET avec leurs deux dénominations', async () => {
    expect(await lireLesEmployeusesDuSiret(Siret(siret))).toEqual([
      {
        id: state.antenneId,
        denominationAntenne: 'Antenne de Rennes',
        denominationSirene: 'Association des tests',
      },
      {
        id: state.sireneId,
        denominationAntenne: null,
        denominationSirene: 'Employeuse nommée par SIRENE',
      },
    ])
  })
})
