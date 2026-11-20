import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { semerLesEmployeusesDeDemonstration } from '@/features/employeuse/fixtures/employeuses-de-demonstration'
import {
  mediateque,
  semerLesLieuxDeDemonstration,
  structureEmployeuse,
} from '@/features/lieux-activite/fixtures/lieux-de-demonstration'
import { seedPersonnesMain } from '@/features/utilisateurs/fixtures/personnesMainConseillerNumerique'
import type { UserFixture } from '@/features/utilisateurs/fixtures/upsertUserFixture'

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
    await semerLesLieuxDeDemonstration(prismaClient)
    await semerLesEmployeusesDeDemonstration(prismaClient, {
      structureEmployeuse,
      mediateque,
    })
    await prismaClient.user.create({
      data: { id: idDuCompteReel, email, isFixture: false },
    })
  })

  afterAll(async () => {
    await prismaClient.user.delete({ where: { id: idDuCompteReel } })
  })

  it("n'écrit dans main que les fixtures présentes dans coop, sans échouer sur celles qu'un compte réel a fait ignorer", async () => {
    await expect(
      seedPersonnesMain(
        prismaClient,
        { structureCoopId: structureEmployeuse.id },
        [fixtureIgnoree],
      ),
    ).resolves.toBeUndefined()
  })
})
