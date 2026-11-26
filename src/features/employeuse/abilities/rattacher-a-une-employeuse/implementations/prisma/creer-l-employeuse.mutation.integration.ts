import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { IdentiteEmployeuse } from '@/features/employeuse/domain/identite-employeuse'
import { AdresseIndisponible } from '@/libraries/ban'
import { creerLEmployeuse } from './creer-l-employeuse.mutation'

const nettoyer = async (siret: string) => {
  const creees = await prismaClient.structureAdministrativeMain.findMany({
    where: { siret },
    select: { adresseId: true },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { siret },
  })
  await prismaClient.adresseMain.deleteMany({
    where: {
      id: {
        in: creees.flatMap(({ adresseId }) =>
          adresseId === null ? [] : [adresseId],
        ),
      },
      nomCommune: 'COMMUNE-TEST-REPLI',
    },
  })
}

describe('créer l’employeuse, service d’adresse indisponible', () => {
  const siret = '99999999999996'

  afterAll(async () => {
    await nettoyer(siret)
  })

  it('crée l’employeuse à l’adresse de la source', async () => {
    const creee = await creerLEmployeuse({
      geocoder: async () => {
        throw new AdresseIndisponible('HTTP 503')
      },
    })(
      IdentiteEmployeuse({
        siret,
        denomination: 'Employeuse sans géocodage',
        adresse: {
          voie: '3 rue du Repli',
          codePostal: '75001',
          commune: 'COMMUNE-TEST-REPLI',
          codeInsee: '75101',
        },
      }),
    )

    const ligne = await prismaClient.structureAdministrativeMain.findUnique({
      where: { id: creee },
      select: { adresse: { select: { nomVoie: true, codeBan: true } } },
    })

    expect(ligne?.adresse).toEqual({ nomVoie: '3 rue du Repli', codeBan: null })
  })
})

describe('créer l’employeuse, SIRET non diffusible', () => {
  const siret = '93429789600011'

  beforeAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
  })

  afterAll(async () => {
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret },
    })
  })

  it('crée une employeuse pour un SIRET [Non-Diffusible]', async () => {
    const creee = await creerLEmployeuse({
      geocoder: async () => null,
    })(
      IdentiteEmployeuse({
        siret,
        denomination: '[Non-Diffusible]',
        adresse: {
          voie: '[Non-Diffusible]',
          commune: 'Villeurbanne',
          codeInsee: '69266',
          codePostal: null,
        },
      }),
    )

    expect(creee).toBeGreaterThan(0)
  })
})
