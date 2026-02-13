import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { queryStructuresForList } from '../list/queryStructuresForList'
import {
  StructuresDataTable,
  type StructuresDataTableSearchParams,
} from '../list/StructuresDataTable'

type SearchStructuresOptions = {
  searchParams?: StructuresDataTableSearchParams
}

const DEFAULT_PAGE_SIZE = 100

export const searchStructures = async (options: SearchStructuresOptions) => {
  const searchParams = options.searchParams ?? {}

  const orderBy = getDataTableOrderBy(searchParams, StructuresDataTable)

  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  const matchesWhere = {
    suppression: null,
    AND: toQueryParts(searchParams).map((part) => ({
      OR: [
        { nom: { contains: part, mode: 'insensitive' } },
        { siret: { contains: part, mode: 'insensitive' } },
        { adresse: { contains: part, mode: 'insensitive' } },
        { commune: { contains: part, mode: 'insensitive' } },
        { codePostal: { contains: part, mode: 'insensitive' } },
      ],
    })),
  } satisfies Prisma.StructureWhereInput

  const structures = await queryStructuresForList({
    where: matchesWhere,
    take,
    skip,
    orderBy,
  })

  const matchesCount = await prismaClient.structure.count({
    where: matchesWhere,
  })

  const totalPages = take ? Math.ceil(matchesCount / take) : 1

  return {
    structures,
    matchesCount,
    moreResults: Math.max(matchesCount - (take ?? 0), 0),
    totalPages,
  }
}

export type SearchStructuresResult = Awaited<
  ReturnType<typeof searchStructures>
>
