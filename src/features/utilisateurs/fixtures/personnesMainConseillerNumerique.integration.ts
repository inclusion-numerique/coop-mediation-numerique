import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { seedPersonnesMain } from '@/features/utilisateurs/fixtures/personnesMainConseillerNumerique'
import type { UserFixture } from '@/features/utilisateurs/fixtures/upsertUserFixture'
import { seedStructures } from '@/fixtures/structures'

describe('seedPersonnesMain', () => {
  const email = `compte-reel+${v4()}@test.gouv.fr`
  const idDuCompteReel = v4()

  const fixtureIgnoree: UserFixture = {
    id: v4(),
    email,
    isFixture: true,
    employeDeLaStructureEmployeuse: true,
  }

  beforeAll(async () => {
    await seedStructures(prismaClient)
    await prismaClient.user.create({
      data: { id: idDuCompteReel, email, isFixture: false },
    })
  })

  afterAll(async () => {
    await prismaClient.user.delete({ where: { id: idDuCompteReel } })
  })

  it("n'écrit dans main que les fixtures présentes dans coop, sans échouer sur celles qu'un compte réel a fait ignorer", async () => {
    await expect(
      seedPersonnesMain(prismaClient, [fixtureIgnoree]),
    ).resolves.toBeUndefined()
  })
})
