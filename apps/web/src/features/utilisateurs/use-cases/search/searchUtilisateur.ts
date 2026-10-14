import type { Prisma } from '@app/web/generated/prisma/client'
import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
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

const FRAGMENT_D_IDENTIFIANT = /^[0-9a-f-]+$/i

const identifiantsContenant = async (part: string): Promise<string[]> =>
  FRAGMENT_D_IDENTIFIANT.test(part)
    ? (
        await prismaClient.$queryRaw<{ id: string }[]>`
          SELECT id::text AS id FROM coop.users WHERE id::text ILIKE ${`%${part}%`}
        `
      ).map(({ id }) => id)
    : []

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

  const termes = await Promise.all(
    toQueryParts(searchParams).map(async (part) => ({
      part,
      identifiants: await identifiantsContenant(part),
    })),
  )

  const matchesWhere = {
    AND: [
      {
        ...utilisateursListWhere({ mediateurId }),
        AND: termes.map(({ part, identifiants }) => ({
          OR: [
            { firstName: { contains: part, mode: 'insensitive' } },
            { lastName: { contains: part, mode: 'insensitive' } },
            { email: { contains: part, mode: 'insensitive' } },
            { id: { in: identifiants } },
          ],
        })),
      },
      filterOnRoles(parsedQueryParams.data),
      filterOnDispositif(parsedQueryParams.data),
      filterOnStatut(new Date())(parsedQueryParams.data),
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

export type UtilisateurWithStatutCompte =
  SearchUtilisateurResult['utilisateurs'][number] & {
    statutCompte: string
  }
