import { lieuxForListSelect } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const getLieuxActiviteListPageData = async ({
  mediateurId,
  tri = 'nomaz',
}: {
  mediateurId: string
  tri?: string
}) => {
  const orderBy: Prisma.MediateurEnActiviteOrderByWithRelationInput =
    tri === 'majrecent' || tri === 'majancien'
      ? { structure: { modification: tri === 'majrecent' ? 'desc' : 'asc' } }
      : { structure: { nom: tri === 'nomza' ? 'desc' : 'asc' } }

  return prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateurId,
      suppression: null,
      fin: null,
    },
    select: {
      id: true,
      creation: true,
      modification: true,
      debut: true,
      fin: true,
      structure: {
        select: lieuxForListSelect,
      },
    },
    orderBy,
  })
}

export type LieuxActiviteListPageData = Awaited<
  ReturnType<typeof getLieuxActiviteListPageData>
>
