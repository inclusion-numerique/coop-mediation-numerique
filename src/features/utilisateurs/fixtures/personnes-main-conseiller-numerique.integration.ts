import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurAEnregistrer } from '@/features/utilisateurs/fixtures/enregistrer-les-utilisateurs'
import { seedPersonnesMain } from '@/features/utilisateurs/fixtures/personnes-main-conseiller-numerique'

describe('seedPersonnesMain', () => {
  const email = `compte-reel+${v4()}@test.gouv.fr`
  const idDuCompteReel = v4()
  const structureCoopId = v4()

  const fixtureIgnoree: UtilisateurAEnregistrer = {
    id: v4(),
    email,
    isFixture: true,
    employeDeLaStructureEmployeuse: true,
  }

  beforeAll(async () => {
    await prismaClient.structureAdministrativeMain.create({
      data: { structureCoopId },
    })
    await prismaClient.user.create({
      data: { id: idDuCompteReel, email, isFixture: false },
    })
  })

  afterAll(async () => {
    await prismaClient.contratMain.deleteMany({
      where: { structureAdministrative: { structureCoopId } },
    })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrative: { structureCoopId } },
    })
    await prismaClient.structureAdministrativeMain.delete({
      where: { structureCoopId },
    })
    await prismaClient.user.delete({ where: { id: idDuCompteReel } })
  })

  it("n'écrit dans main que les fixtures présentes dans coop, sans échouer sur celles qu'un compte réel a fait ignorer", async () => {
    await expect(
      seedPersonnesMain(prismaClient, { structureCoopId }, [fixtureIgnoree]),
    ).resolves.toBeUndefined()
  })
})
