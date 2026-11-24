import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'

const COOP_SOURCE = 'coop'

type PrismaLike = Prisma.TransactionClient

// Upsert d'une affectation coop : crée la ligne si absente, (ré)active/désactive selon `estActive`.
export const ensureAffectationEmploiMain = async (
  {
    personneId,
    structureAdministrativeId,
    estActive = true,
  }: {
    personneId: number
    structureAdministrativeId: number
    estActive?: boolean
  },
  prisma: PrismaLike = prismaClient,
): Promise<{ id: number }> =>
  prisma.personneAffectationEmploiMain.upsert({
    where: {
      personneId_structureAdministrativeId_source: {
        personneId,
        structureAdministrativeId,
        source: COOP_SOURCE,
      },
    },
    create: {
      personneId,
      structureAdministrativeId,
      source: COOP_SOURCE,
      estActive,
    },
    update: { estActive },
    select: { id: true },
  })

export const deactivateCoopAffectationsExcept = async (
  {
    personneId,
    keepStructureAdministrativeIds,
  }: {
    personneId: number
    keepStructureAdministrativeIds: number[]
  },
  prisma: PrismaLike = prismaClient,
): Promise<void> => {
  await prisma.personneAffectationEmploiMain.updateMany({
    where: {
      personneId,
      source: COOP_SOURCE,
      estActive: true,
      structureAdministrativeId: { notIn: keepStructureAdministrativeIds },
    },
    data: { estActive: false },
  })
}
