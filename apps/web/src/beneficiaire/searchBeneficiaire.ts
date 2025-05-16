import {
  BeneficiairesDataTable,
  type BeneficiairesDataTableSearchParams,
} from '@app/web/beneficiaire/BeneficiairesDataTable'
import { queryBeneficiairesForList } from '@app/web/beneficiaire/queryBeneficiairesForList'
import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

type SearchBeneficiaireOptions = {
  mediateurId?: string
  searchParams?: BeneficiairesDataTableSearchParams
  excludeIds?: string[]
}

// List beneficiaires not anonymous
export const beneficiairesListWhere = (mediateurId?: string) =>
  ({
    suppression: null,
    mediateurId,
    anonyme: false,
  }) satisfies Prisma.BeneficiaireWhereInput

export const searchBeneficiaire = async (
  options: SearchBeneficiaireOptions,
) => {
  const searchParams = options.searchParams ?? {}
  const { mediateurId } = options

  const orderBy = getDataTableOrderBy(searchParams, BeneficiairesDataTable)

  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  const excludeIds = options.excludeIds ?? []

  const matchesWhere = {
    ...beneficiairesListWhere(mediateurId),
    AND: toQueryParts(searchParams).map((part) => ({
      OR: [
        { prenom: { contains: part, mode: 'insensitive' } },
        { nom: { contains: part, mode: 'insensitive' } },
        { commune: { contains: part, mode: 'insensitive' } },
        { email: { contains: part, mode: 'insensitive' } },
        { communeCodePostal: { contains: part, mode: 'insensitive' } },
      ],
    })),
    ...(excludeIds.length > 0 ? { id: { notIn: options.excludeIds } } : null),
  } satisfies Prisma.BeneficiaireWhereInput

  const beneficiaires = await queryBeneficiairesForList({
    where: matchesWhere,
    take,
    skip,
    orderBy,
  })

  const matchesCount = await prismaClient.beneficiaire.count({
    where: matchesWhere,
  })

  const totalPages = take ? Math.ceil(matchesCount / take) : 1

  return {
    beneficiaires,
    matchesCount,
    moreResults: Math.max(matchesCount - (take ?? 0), 0),
    totalPages,
  }
}

export type SearchBeneficiaireResult = Awaited<
  ReturnType<typeof searchBeneficiaire>
>
