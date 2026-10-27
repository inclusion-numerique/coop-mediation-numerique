import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { ensurePersonneMain } from './ensurePersonneMain'

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

export const dualWriteEmployeuseAffectation = async (
  {
    coopUserId,
    email,
    structureMainId,
  }: {
    coopUserId: string
    email: string
    structureMainId: number | null
  },
  prisma: PrismaLike = prismaClient,
): Promise<void> => {
  const personne = await ensurePersonneMain({ coopUserId, email }, prisma)
  if (structureMainId !== null) {
    await ensureAffectationEmploiMain(
      { personneId: personne.id, structureAdministrativeId: structureMainId },
      prisma,
    )
  }
}
