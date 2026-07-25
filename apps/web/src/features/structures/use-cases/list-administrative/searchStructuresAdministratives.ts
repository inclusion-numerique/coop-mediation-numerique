import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { queryStructuresAdministrativesForList } from './queryStructuresAdministrativesForList'
import {
  StructuresAdministrativesDataTable,
  type StructuresAdministrativesDataTableSearchParams,
} from './StructuresAdministrativesDataTable'

type SearchStructuresAdministrativesOptions = {
  searchParams?: StructuresAdministrativesDataTableSearchParams
}

const DEFAULT_PAGE_SIZE = 100

// Recherche paginée des EMPLOYEUSES pour la data-table d'administration.
// Frère de `searchLieux` (liste des LIEUX). La fonction socle
// `searchStructureAdministrative` reste l'autocomplete mono-page (fusion, search-single).
export const searchStructuresAdministratives = async (
  options: SearchStructuresAdministrativesOptions,
) => {
  const searchParams = options.searchParams ?? {}

  const orderBy = getDataTableOrderBy(
    searchParams,
    StructuresAdministrativesDataTable,
  )

  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  // ADR-002 échange final : recherche sur `main.structure_administrative`. Le nom couvre les deux
  // dénominations (antenne/sirene) ; adresse/commune/code postal viennent de la relation `adresse`.
  const matchesWhere = {
    deletedAt: null,
    AND: toQueryParts(searchParams).map((part) => ({
      OR: [
        { denominationSirene: { contains: part, mode: 'insensitive' } },
        { denominationAntenne: { contains: part, mode: 'insensitive' } },
        { siret: { contains: part, mode: 'insensitive' } },
        { adresse: { nomVoie: { contains: part, mode: 'insensitive' } } },
        { adresse: { nomCommune: { contains: part, mode: 'insensitive' } } },
        { adresse: { codePostal: { contains: part, mode: 'insensitive' } } },
      ],
    })),
  } satisfies Prisma.StructureAdministrativeMainWhereInput

  const structures = await queryStructuresAdministrativesForList({
    where: matchesWhere,
    take,
    skip,
    orderBy,
  })

  const matchesCount = await prismaClient.structureAdministrativeMain.count({
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

export type SearchStructuresAdministrativesResult = Awaited<
  ReturnType<typeof searchStructuresAdministratives>
>
