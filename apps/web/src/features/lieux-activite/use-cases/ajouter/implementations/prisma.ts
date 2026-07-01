import { inject, key } from '@app/web/libs/injection'
import { findCartoStructure as findCartoStructureInEntrepot } from '@app/web/structure/cartoStructureFromEntrepot'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
import type { PrismaClient } from '@prisma/client'
import { v4 } from 'uuid'
import type {
  CreatedActivite,
  CreateMediateurEnActivite,
  CreateStructureFromCarto,
  CreateStructureFromData,
  FindCartoStructure,
  FindExistingLieuxActivite,
  FindStructuresByCartoIds,
  StructureToCreate,
} from '../domain'

type TransactionalPrismaClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export const PRISMA_CLIENT_KEY = key<TransactionalPrismaClient>('prismaClient')

export const findExistingLieuxActivite: FindExistingLieuxActivite = async (
  userId,
) => {
  const prisma = inject(PRISMA_CLIENT_KEY)
  const mediateursEnActivite = await prisma.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId },
      suppression: null,
      fin: null,
    },
    select: {
      lieuInclusion: {
        select: {
          id: true,
          structureCartographieNationaleId: true,
        },
      },
    },
  })

  return mediateursEnActivite.map((a) => ({
    structureId: a.lieuInclusion.id,
    cartoId: a.lieuInclusion.structureCartographieNationaleId,
  }))
}

export const findStructuresByCartoIds: FindStructuresByCartoIds = async (
  cartoIds,
) => {
  if (cartoIds.length === 0) return new Map()

  const prisma = inject(PRISMA_CLIENT_KEY)
  const structures = await prisma.lieuInclusion.findMany({
    where: {
      structureCartographieNationaleId: { in: cartoIds },
    },
    select: {
      id: true,
      structureCartographieNationaleId: true,
    },
  })

  return new Map(
    structures
      .filter((s) => s.structureCartographieNationaleId != null)
      .map((s) => [s.structureCartographieNationaleId as string, s.id]),
  )
}

export const findCartoStructure: FindCartoStructure = (cartoId) =>
  findCartoStructureInEntrepot(cartoId)

export const createStructureFromData: CreateStructureFromData = async (
  data: StructureToCreate,
) => {
  const prisma = inject(PRISMA_CLIENT_KEY)
  return prisma.lieuInclusion.create({
    data: {
      id: v4(),
      nom: data.nom,
      siret: data.siret,
      adresse: data.adresse,
      complementAdresse: data.complementAdresse,
      commune: data.commune,
      codePostal: data.codePostal,
      codeInsee: data.codeInsee,
    },
    select: { id: true },
  })
}

export const createStructureFromCarto: CreateStructureFromCarto = async (
  cartoStructure,
) => {
  const prisma = inject(PRISMA_CLIENT_KEY)
  return prisma.lieuInclusion.create({
    data: toStructureFromCartoStructure(cartoStructure),
    select: { id: true },
  })
}

export const createMediateurEnActivite: CreateMediateurEnActivite = async (
  mediateurId,
  structureId,
): Promise<CreatedActivite> => {
  const prisma = inject(PRISMA_CLIENT_KEY)
  return prisma.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { id: mediateurId } },
      lieuInclusion: { connect: { id: structureId } },
      debut: new Date(),
    },
    select: { id: true, structureId: true },
  })
}
