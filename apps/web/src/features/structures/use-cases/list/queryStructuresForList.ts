import { getEmploisCountByCorrelation } from '@app/web/features/structures/correlateStructureAdministrative'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const searchStructureSelect = {
  id: true,
  nom: true,
  adresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  siret: true,
  typologies: true,
  visiblePourCartographieNationale: true,
  structureCartographieNationaleId: true,
  creation: true,
  modification: true,
  suppression: true,
  _count: {
    select: {
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
          mediateur: { user: { deleted: null } },
        },
      },
    },
  },
} satisfies Prisma.StructureSelect

export const queryStructuresForList = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.StructureWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.StructureOrderByWithRelationInput[]
}) => {
  const structures = await prismaClient.structure.findMany({
    where,
    take,
    skip,
    select: searchStructureSelect,
    orderBy: [...(orderBy ?? []), { nom: 'asc' }],
  })

  // Compteur d'emplois par corrélation nom + code INSEE avec l'employeuse (pas de lien FK).
  const emploisCounts = await getEmploisCountByCorrelation(structures, {
    activeOnly: false,
  })

  return structures.map((structure) => ({
    ...structure,
    emploisCount: emploisCounts.get(structure.id) ?? 0,
  }))
}

export type StructureForList = Awaited<
  ReturnType<typeof queryStructuresForList>
>[number]
