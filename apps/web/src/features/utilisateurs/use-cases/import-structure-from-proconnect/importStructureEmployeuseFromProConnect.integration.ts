import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import { importStructureEmployeuseFromSiret } from '@app/web/features/structures/importStructureEmployeuseFromSiret'
import { prismaClient } from '@app/web/prismaClient'
import { importStructureEmployeuseFromProConnect } from './importStructureEmployeuseFromProConnect'

jest.mock(
  '@app/web/features/structures/importStructureEmployeuseFromSiret',
  () => ({
    importStructureEmployeuseFromSiret: jest.fn(),
  }),
)

const mockedImportStructureEmployeuseFromSiret =
  importStructureEmployeuseFromSiret as jest.MockedFunction<
    typeof importStructureEmployeuseFromSiret
  >

const PROCONNECT_SIRET = '11111111111111'
const PROCONNECT_STRUCTURE_ID = '0f4addf8-b74b-49f9-8f57-ff2e0ec30d93'
const OTHER_SIRET = '22222222222222'
const OTHER_STRUCTURE_ID = '57de4603-e306-46f8-b6ce-ecf50ca6f213'

describe('importStructureEmployeuseFromProConnect', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
  })

  beforeEach(async () => {
    mockedImportStructureEmployeuseFromSiret.mockReset()
    mockedImportStructureEmployeuseFromSiret.mockResolvedValue({
      structureId: PROCONNECT_STRUCTURE_ID,
    })

    await resetFixtureUser(mediateurSansActivites, false)
    await prismaClient.employeStructure.deleteMany({
      where: { userId: mediateurSansActivites.id },
    })
    // Rôle employeuse (split 1a.2) : les emplois pointent structure_administrative.
    await prismaClient.structureAdministrative.upsert({
      where: { id: PROCONNECT_STRUCTURE_ID },
      update: { siret: PROCONNECT_SIRET },
      create: {
        id: PROCONNECT_STRUCTURE_ID,
        nom: 'Structure ProConnect',
        adresse: '1 rue du ProConnect',
        codePostal: '75001',
        commune: 'Paris',
        codeInsee: '75056',
        siret: PROCONNECT_SIRET,
        source: 'coop',
      },
    })
    await prismaClient.structureAdministrative.upsert({
      where: { id: OTHER_STRUCTURE_ID },
      update: { siret: OTHER_SIRET },
      create: {
        id: OTHER_STRUCTURE_ID,
        nom: 'Autre structure',
        adresse: '2 rue de la structure',
        codePostal: '69001',
        commune: 'Lyon',
        codeInsee: '69381',
        siret: OTHER_SIRET,
        source: 'coop',
      },
    })
  })

  test('should create a new ProConnect emploi when existing emploi is ended', async () => {
    await prismaClient.employeStructure.create({
      data: {
        userId: mediateurSansActivites.id,
        structureId: PROCONNECT_STRUCTURE_ID,
        debut: new Date('2023-01-01T00:00:00.000Z'),
        fin: new Date('2023-12-31T00:00:00.000Z'),
      },
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    const emplois = await prismaClient.employeStructure.findMany({
      where: {
        userId: mediateurSansActivites.id,
        structureId: PROCONNECT_STRUCTURE_ID,
        suppression: null,
      },
      select: { debut: true, fin: true },
      orderBy: { debut: 'asc' },
    })

    const activeEmplois = emplois.filter((emploi) => emploi.fin === null)

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(mockedImportStructureEmployeuseFromSiret).toHaveBeenCalledTimes(1)
    expect(emplois.length).toBe(2)
    expect(activeEmplois.length).toBe(1)
  })

  test('should soft-delete temporary emploi with another SIRET and create ProConnect emploi', async () => {
    const oldEmploi = await prismaClient.employeStructure.create({
      data: {
        userId: mediateurSansActivites.id,
        structureId: OTHER_STRUCTURE_ID,
        debut: null,
        fin: null,
      },
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    const oldEmploiAfter =
      await prismaClient.employeStructure.findUniqueOrThrow({
        where: { id: oldEmploi.id },
        select: { suppression: true, fin: true },
      })
    const newEmploi = await prismaClient.employeStructure.findFirst({
      where: {
        userId: mediateurSansActivites.id,
        structureId: PROCONNECT_STRUCTURE_ID,
        suppression: null,
      },
      select: { id: true, debut: true, fin: true },
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(oldEmploiAfter.suppression).not.toBeNull()
    expect(oldEmploiAfter.fin).not.toBeNull()
    expect(newEmploi).not.toBeNull()
    expect(newEmploi?.debut).not.toBeNull()
    expect(newEmploi?.fin).toBeNull()
  })

  test('should end running emploi with another SIRET yesterday and create ProConnect emploi', async () => {
    const oldEmploi = await prismaClient.employeStructure.create({
      data: {
        userId: mediateurSansActivites.id,
        structureId: OTHER_STRUCTURE_ID,
        debut: new Date('2024-01-01T00:00:00.000Z'),
        fin: null,
      },
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    const oldEmploiAfter =
      await prismaClient.employeStructure.findUniqueOrThrow({
        where: { id: oldEmploi.id },
        select: { suppression: true, fin: true },
      })
    const newEmploi = await prismaClient.employeStructure.findFirst({
      where: {
        userId: mediateurSansActivites.id,
        structureId: PROCONNECT_STRUCTURE_ID,
        suppression: null,
        fin: null,
      },
      select: { id: true },
    })
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(oldEmploiAfter.suppression).toBeNull()
    expect(oldEmploiAfter.fin).not.toBeNull()
    expect(oldEmploiAfter.fin?.getTime()).toBeLessThan(startOfToday.getTime())
    expect(newEmploi).not.toBeNull()
  })

  test('should be no-op when user has running emploi on the same SIRET', async () => {
    await prismaClient.employeStructure.create({
      data: {
        userId: mediateurSansActivites.id,
        structureId: PROCONNECT_STRUCTURE_ID,
        debut: new Date('2024-01-01T00:00:00.000Z'),
        fin: null,
      },
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(mockedImportStructureEmployeuseFromSiret).not.toHaveBeenCalled()
  })

  test('should be no-op for conseiller numerique users', async () => {
    await resetFixtureUser(conseillerNumerique, false)

    const beforeCount = await prismaClient.employeStructure.count({
      where: { userId: conseillerNumerique.id },
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: conseillerNumerique.id,
      siret: PROCONNECT_SIRET,
    })

    const afterCount = await prismaClient.employeStructure.count({
      where: { userId: conseillerNumerique.id },
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(afterCount).toBe(beforeCount)
    expect(mockedImportStructureEmployeuseFromSiret).not.toHaveBeenCalled()
  })

  test('should be no-op when no SIRET is provided', async () => {
    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: null,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
  })
})
