import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import { prismaClient } from '@app/web/prismaClient'
import { importStructureEmployeuseFromProConnect } from './importStructureEmployeuseFromProConnect'

describe('importStructureEmployeuseFromProConnect', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
  })

  beforeEach(async () => {
    await resetFixtureUser(mediateurSansActivites, false)
    await prismaClient.employeStructure.deleteMany({
      where: { userId: mediateurSansActivites.id },
    })
  })

  test('should be no-op when user already has one temporary contract', async () => {
    const structure = await prismaClient.structure.findFirstOrThrow({
      select: { id: true },
    })

    await prismaClient.employeStructure.create({
      data: {
        userId: mediateurSansActivites.id,
        structureId: structure.id,
        debut: null,
        fin: null,
      },
    })

    const result = await importStructureEmployeuseFromProConnect({
      userId: mediateurSansActivites.id,
      siret: '11111111111111',
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
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
