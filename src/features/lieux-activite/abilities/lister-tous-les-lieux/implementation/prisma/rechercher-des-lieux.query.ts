import { prismaClient } from '@/configuration/prisma/prismaClient'
import type { Prisma } from '@/generated/prisma/client'
import { DEFAULT_PAGE } from '@/libraries/data-table/pagination/page-size-options'
import { takeAndSkipFromPage } from '@/libraries/data-table/pagination/takeAndSkipFromPage'
import { toQueryParts } from '@/libraries/data-table/search/toQueryParts'
import { entierPositifLu } from '@/libraries/parametres-d-url'
import {
  type ListeDesLieuxSearchParams,
  TAILLE_DE_PAGE_PAR_DEFAUT,
} from '../../ui/lister-tous-les-lieux-search-params'
import { lieuxPourLaListe } from './lieux-pour-la-liste.query'
import { ordreDesLieux } from './tri-des-lieux'

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
}: {
  searchParams?: ListeDesLieuxSearchParams
}) => {
  const { take, skip } = takeAndSkipFromPage({
    page: entierPositifLu(searchParams?.page, DEFAULT_PAGE),
    pageSize: entierPositifLu(searchParams?.lignes, TAILLE_DE_PAGE_PAR_DEFAUT),
  })

  const matchesWhere = {
    suppression: null,
    AND: toQueryParts(searchParams).map(dansLesDeuxFiches),
  } satisfies Prisma.LieuInclusionWhereInput

  const structures = await lieuxPourLaListe({
    where: matchesWhere,
    take,
    skip,
    orderBy: ordreDesLieux(searchParams),
  })

  const [matchesCount, totalCount] = await Promise.all([
    prismaClient.lieuInclusion.count({ where: matchesWhere }),
    prismaClient.lieuInclusion.count({ where: { suppression: null } }),
  ])

  return {
    totalCount,
    searchParams,
    searchResult: {
      structures,
      matchesCount,
      pageSize: take,
    },
  }
}
