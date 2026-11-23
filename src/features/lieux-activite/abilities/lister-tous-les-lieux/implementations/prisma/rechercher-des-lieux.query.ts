import { prismaClient } from '@/configuration/prisma/prismaClient'
import type { Prisma } from '@/generated/prisma/client'
import { takeAndSkipFromPage } from '@/libraries/data-table/pagination/takeAndSkipFromPage'
import { toQueryParts } from '@/libraries/data-table/search/toQueryParts'
import type { CriteresDeLaListe } from '../../domain/criteres-de-la-liste'
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

export const rechercherDesLieux = async (criteres: CriteresDeLaListe) => {
  const { take, skip } = takeAndSkipFromPage({
    page: criteres.page,
    pageSize: criteres.lignes,
  })

  const matchesWhere = {
    suppression: null,
    AND: toQueryParts(criteres).map(dansLesDeuxFiches),
  } satisfies Prisma.LieuInclusionWhereInput

  const structures = await lieuxPourLaListe({
    where: matchesWhere,
    take,
    skip,
    orderBy: ordreDesLieux(criteres.tri),
  })

  const [matchesCount, totalCount] = await Promise.all([
    prismaClient.lieuInclusion.count({ where: matchesWhere }),
    prismaClient.lieuInclusion.count({ where: { suppression: null } }),
  ])

  return {
    totalCount,
    searchResult: {
      structures,
      matchesCount,
      pageSize: take,
    },
  }
}
