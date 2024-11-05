import type { Prisma } from '@prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { takeAndSkipFromPage } from '@app/web/data-table/takeAndSkipFromPage'

type SearchMediateurOptions = {
  coordinateurId?: string
  searchParams: { recherche: string }
}

export const searchMediateur = async (options: SearchMediateurOptions) => {
  const searchParams = options.searchParams ?? {}
  const { coordinateurId } = options

  const pageSize = 10
  const page = 1
  const { take, skip } = takeAndSkipFromPage({ page, pageSize })

  const queryParts = searchParams.recherche?.split(' ') ?? []

  const mediateurIds = await prismaClient.mediateurCoordonne.findMany({
    where: { coordinateurId },
    select: { mediateurId: true },
  })

  const matchesWhere = {
    id: { in: mediateurIds.map(({ mediateurId }) => mediateurId) },
    user: {
      AND: queryParts.map((part) => ({
        OR: [
          { firstName: { contains: part, mode: 'insensitive' } },
          { lastName: { contains: part, mode: 'insensitive' } },
          { email: { contains: part, mode: 'insensitive' } },
        ],
      })),
    },
  } satisfies Prisma.MediateurWhereInput

  const mediateurs = await prismaClient.mediateur.findMany({
    where: matchesWhere,
    select: {
      id: true,
      user: {
        select: {
          id: true,
          lastName: true,
          firstName: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
    take,
    skip,
  })

  const matchesCount = await prismaClient.mediateur.count({
    where: matchesWhere,
  })

  const totalPages = take ? Math.ceil(matchesCount / take) : 1

  return {
    mediateurs,
    matchesCount,
    moreResults: Math.max(matchesCount - (take ?? 0), 0),
    totalPages,
  }
}

export type SearchMediateurResult = Awaited<ReturnType<typeof searchMediateur>>