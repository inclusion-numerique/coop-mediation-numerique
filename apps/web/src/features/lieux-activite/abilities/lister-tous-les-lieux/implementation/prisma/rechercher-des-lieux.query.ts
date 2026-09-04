import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { lieuxPourLaListe } from './lieux-pour-la-liste.query'

/**
 * Ce que l'écran soumet : les mots cherchés, la page et son ampleur.
 *
 * Le tri, lui, ARRIVE déjà résolu. Le déduire ici obligerait la requête à
 * importer la configuration de la table — donc ses colonnes, donc ses
 * composants : une lecture de base de données ne charge pas de DSFR.
 */
export type RechercheDeLieuxParams = {
  recherche?: string
  page?: string
  lignes?: string
}

const DEFAULT_PAGE_SIZE = 100

/**
 * Les lieux que l'administration cherche, et combien la coop en compte.
 *
 * Le total ne dépend d'aucun critère : c'est le repère qui donne son sens au
 * nombre de résultats — « 12 trouvés » ne dit rien sans « sur 12 750 ».
 */
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
    AND: toQueryParts(searchParams).map((part) => ({
      OR: [
        { nom: { contains: part, mode: 'insensitive' } },
        { siret: { contains: part, mode: 'insensitive' } },
        { adresse: { contains: part, mode: 'insensitive' } },
        { commune: { contains: part, mode: 'insensitive' } },
        { codePostal: { contains: part, mode: 'insensitive' } },
      ],
    })),
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
