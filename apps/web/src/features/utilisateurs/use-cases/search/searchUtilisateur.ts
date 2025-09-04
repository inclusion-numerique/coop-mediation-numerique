import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  filterOnDispositif,
  filterOnLieux,
  filterOnRoles,
  filterOnStatut,
} from '../filter/filterUtilisateur'
import { UtiliateursFilterValidations } from '../filter/utilisateursFilters'
import { queryUtilisateursForList } from '../list/queryUtilisateursForList'
import {
  UtilisateursDataTable,
  type UtilisateursDataTableSearchParams,
} from '../list/UtilisateursDataTable'

type SearchUtilisateurOptions = {
  mediateurId?: string
  searchParams?: UtilisateursDataTableSearchParams
}

// List utilisateurs
const utilisateursListWhere = (
  // TODO Does this need to be implemented ?
  { mediateurId: _mediateurId }: { mediateurId?: string },
) => ({}) satisfies Prisma.UserWhereInput

const DEFAULT_PAGE_SIZE = 100

export const searchUtilisateur = async (options: SearchUtilisateurOptions) => {
  const searchParams = options.searchParams ?? {}
  const { mediateurId } = options

  const parsedQueryParams = z
    .object(UtiliateursFilterValidations)
    .safeParse(searchParams)

  const orderBy = getDataTableOrderBy(searchParams, UtilisateursDataTable)

  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  const matchesWhere = {
    AND: [
      {
        ...utilisateursListWhere({ mediateurId }),
        AND: toQueryParts(searchParams).map((part) => ({
          OR: [
            { firstName: { contains: part, mode: 'insensitive' } },
            { lastName: { contains: part, mode: 'insensitive' } },
            { email: { contains: part, mode: 'insensitive' } },
          ],
        })),
      },
      filterOnRoles(parsedQueryParams.data),
      filterOnDispositif(parsedQueryParams.data),
      filterOnStatut(parsedQueryParams.data),
      filterOnLieux(parsedQueryParams.data),
    ],
  } satisfies Prisma.UserWhereInput

  const utilisateurs = await queryUtilisateursForList({
    where: matchesWhere,
    take,
    skip,
    orderBy,
  })

  const matchesCount = await prismaClient.user.count({
    where: matchesWhere,
  })

  const totalPages = take ? Math.ceil(matchesCount / take) : 1

  return {
    utilisateurs,
    matchesCount,
    moreResults: Math.max(matchesCount - (take ?? 0), 0),
    totalPages,
  }
}

export type SearchUtilisateurResult = Awaited<
  ReturnType<typeof searchUtilisateur>
>
