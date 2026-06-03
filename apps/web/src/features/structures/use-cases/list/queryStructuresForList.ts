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
      emplois: { where: { suppression: null } },
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
}) =>
  prismaClient.structure.findMany({
    where,
    take,
    skip,
    select: searchStructureSelect,
    orderBy: [...(orderBy ?? []), { nom: 'asc' }],
  })

export type StructureForList = Awaited<
  ReturnType<typeof queryStructuresForList>
>[number]
