import type { Prisma } from '@app/web/generated/prisma/client'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import { lieuxPourLaListe } from './lieux-pour-la-liste.query'

export type RechercheDeLieuxParams = {
  recherche?: string
  page?: string
  lignes?: string
}

const DEFAULT_PAGE_SIZE = 100

const contient = (part: string) =>
  ({ contains: part, mode: 'insensitive' }) satisfies Prisma.StringFilter

const dansLesDeuxFiches = (part: string) => ({
  OR: [
    { nom: contient(part) },
    { siret: contient(part) },
    { adresse: contient(part) },
    { commune: contient(part) },
    { codePostal: contient(part) },
    { inscriptionRegistre: { nom: contient(part) } },
    { inscriptionRegistre: { adresse: { nomVoie: contient(part) } } },
    { inscriptionRegistre: { adresse: { nomCommune: contient(part) } } },
    { inscriptionRegistre: { adresse: { codePostal: contient(part) } } },
  ],
})

export const rechercherDesLieux = async ({
  searchParams = {},
  orderBy,
}: {
  searchParams?: RechercheDeLieuxParams
  orderBy?: Prisma.LieuInclusionOrderByWithRelationInput[]
}) => {
  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
  })

  const matchesWhere = {
    suppression: null,
    AND: toQueryParts(searchParams).map(dansLesDeuxFiches),
  } satisfies Prisma.LieuInclusionWhereInput

  const structures = await lieuxPourLaListe({
    where: matchesWhere,
    take,
    skip,
    orderBy,
  })

  const [matchesCount, totalCount] = await Promise.all([
    prismaClient.lieuInclusion.count({ where: matchesWhere }),
    prismaClient.lieuInclusion.count({ where: { suppression: null } }),
  ])

  const totalPages = take ? Math.ceil(matchesCount / take) : 1

  return {
    totalCount,
    searchParams,
    searchResult: {
      structures,
      matchesCount,
      moreResults: Math.max(matchesCount - (take ?? 0), 0),
      totalPages,
    },
  }
}

export type LieuxTrouves = Awaited<
  ReturnType<typeof rechercherDesLieux>
>['searchResult']
