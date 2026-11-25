import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { rattacherAUneEmployeuseDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-depuis-siret.mutation'
import { importerLaStructureEmployeuseDepuisProConnect } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/proconnect/importer-la-structure-employeuse-depuis-proconnect.mutation'

const MEDIATEUR = '93b7d259-61b0-4069-ae42-db887984777f'
const CONSEILLER = '09d6e0af-56e7-43b8-a649-b7e9d3c70c51'
const NOS_UTILISATEURS = [MEDIATEUR, CONSEILLER]

const PROCONNECT_SIRET = '11111111111111'
const OTHER_SIRET = '22222222222222'

const importer = importerLaStructureEmployeuseDepuisProConnect(
  rattacherAUneEmployeuseDepuisSiret({
    geocoder: async () => null,
    signaler: () => undefined,
    garantirLaPersonne: ({ coopUserId, email }, transaction) =>
      transaction.personneMain.upsert({
        where: { coopId: coopUserId },
        create: { coopId: coopUserId, contact: { coop: { email } } },
        update: {},
        select: { id: true },
      }),
    synchroniserLaPersonne: async () => undefined,
    etablissementDepuisSiret: async (siret) =>
      siret === PROCONNECT_SIRET
        ? {
            siret,
            raisonSociale: 'Structure ProConnect',
            ferme: false,
            voie: '1 rue du Test',
            commune: 'Paris',
            codePostal: '75001',
            codeInsee: '75101',
          }
        : null,
  }),
)

const employeusesActivesDe = async (userId: string) =>
  (
    await prismaClient.personneAffectationEmploiMain.findMany({
      where: { personne: { coopId: userId }, estActive: true },
      select: { structureAdministrativeId: true },
    })
  ).map(({ structureAdministrativeId }) => structureAdministrativeId)

describe('importerLaStructureEmployeuseDepuisProConnect', () => {
  const state = { proconnectMainId: 0, otherMainId: 0 }

  beforeAll(async () => {
    // Résidu d'un run précédent interrompu : la clé (siret, dénomination) est unique.
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrative: {
          siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] },
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] } },
    })

    const proconnect = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: PROCONNECT_SIRET,
        denominationSirene: 'Structure ProConnect',
        denominationAntenne: 'Structure ProConnect',
      },
      select: { id: true },
    })
    const other = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: OTHER_SIRET,
        denominationSirene: 'Autre structure',
        denominationAntenne: 'Autre structure',
      },
      select: { id: true },
    })
    state.proconnectMainId = proconnect.id
    state.otherMainId = other.id

    await prismaClient.user.createMany({
      data: NOS_UTILISATEURS.map((id) => ({
        id,
        email: `proconnect-${id}@integration.test`,
      })),
      skipDuplicates: true,
    })
  })

  const nettoyerPersonnesDeTest = async () => {
    const deNosPersonnes = { personne: { coopId: { in: NOS_UTILISATEURS } } }
    await prismaClient.contratMain.deleteMany({ where: deNosPersonnes })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: deNosPersonnes,
    })
    await prismaClient.personneMain.deleteMany({
      where: { coopId: { in: NOS_UTILISATEURS } },
    })
  }

  afterAll(async () => {
    await nettoyerPersonnesDeTest()
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrativeId: {
          in: [state.proconnectMainId, state.otherMainId],
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: [state.proconnectMainId, state.otherMainId] } },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: NOS_UTILISATEURS } },
    })
  })

  beforeEach(async () => {
    await nettoyerPersonnesDeTest()
  })

  test('non-CN + SIRET : rattache à l’employeuse du SIRET fourni', async () => {
    const result = await importer({
      userId: MEDIATEUR,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(await employeusesActivesDe(MEDIATEUR)).toEqual([
      state.proconnectMainId,
    ])
  })

  test('conseiller numerique : no-op, aucun rattachement au SIRET fourni', async () => {
    await prismaClient.personneMain.create({
      data: {
        coopId: CONSEILLER,
        affectationsEmploi: {
          create: {
            structureAdministrativeId: state.otherMainId,
            source: 'idposte',
            estActive: true,
          },
        },
      },
    })

    const result = await importer({
      userId: CONSEILLER,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(await employeusesActivesDe(CONSEILLER)).not.toContain(
      state.proconnectMainId,
    )
  })

  test('aucun SIRET fourni : no-op', async () => {
    const result = await importer({
      userId: MEDIATEUR,
      siret: null,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(await employeusesActivesDe(MEDIATEUR)).toEqual([])
  })
})
