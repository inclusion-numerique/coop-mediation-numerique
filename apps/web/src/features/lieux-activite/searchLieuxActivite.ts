import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

type SearchLieuActiviteOptions = {
  mediateurId: string
  searchParams?: {
    recherche?: string
    page?: string
    lignes?: string
  }
}

export const searchLieuxActivite = async ({
  mediateurId,
  searchParams,
}: SearchLieuActiviteOptions) => {
  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  const where = {
    mediateurId,
    suppression: null,
    AND: toQueryParts(searchParams ?? {}).map((part) => ({
      OR: [{ structure: { nom: { contains: part, mode: 'insensitive' } } }],
    })),
  } satisfies Prisma.MediateurEnActiviteWhereInput

  const lieuxActivite = await prismaClient.mediateurEnActivite.findMany({
    where,
    take,
    skip,
    select: {
      id: true,
      creation: true,
      modification: true,
      structure: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          commune: true,
          codePostal: true,
        },
      },
    },
    orderBy: [{ structure: { nom: 'asc' } }],
  })

  const matchesCount = await prismaClient.mediateurEnActivite.count({ where })

  return {
    lieuxActivite,
    matchesCount,
    moreResults: Math.max(matchesCount - (take ?? 0), 0),
    totalPages: take ? Math.ceil(matchesCount / take) : 1,
  }
}
