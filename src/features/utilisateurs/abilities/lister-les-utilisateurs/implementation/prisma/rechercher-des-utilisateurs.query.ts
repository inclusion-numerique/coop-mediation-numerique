import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  ligneUtilisateurSelect,
  ligneUtilisateurToDomain,
} from '@/features/utilisateurs/db/ligne-utilisateur.transfer'
import { utilisateursWhere } from '@/features/utilisateurs/db/utilisateurs.where'
import { utilisateursRattaches } from '@/features/utilisateurs/db/utilisateurs-rattaches.query'
import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import type { Prisma } from '@/generated/prisma/client'
import { DEFAULT_PAGE } from '@/libraries/data-table/pagination/page-size-options'
import { takeAndSkipFromPage } from '@/libraries/data-table/pagination/takeAndSkipFromPage'
import { toQueryParts } from '@/libraries/data-table/search/toQueryParts'
import { entierPositifLu } from '@/libraries/parametres-d-url'
import type { UtilisateursTrouves } from '../../domain'

export type RechercheDUtilisateursParams = {
  readonly recherche?: string
  readonly page?: string
  readonly lignes?: string
}

const LIGNES_PAR_PAGE = 100

export const rechercherDesUtilisateurs = async ({
  searchParams,
  filtres,
  orderBy,
  maintenant,
}: {
  readonly searchParams: RechercheDUtilisateursParams
  readonly filtres: FiltresUtilisateurs
  readonly orderBy: readonly Prisma.UserOrderByWithRelationInput[]
  readonly maintenant: Date
}): Promise<UtilisateursTrouves> => {
  const lignesParPage = entierPositifLu(searchParams.lignes, LIGNES_PAR_PAGE)
  const { take, skip } = takeAndSkipFromPage({
    page: entierPositifLu(searchParams.page, DEFAULT_PAGE),
    pageSize: lignesParPage,
  })

  const where = utilisateursWhere({
    mots: toQueryParts(searchParams).filter((mot) => mot !== ''),
    filtres,
    maintenant,
    rattaches: await utilisateursRattaches(filtres),
  })

  const [lignes, matchesCount, totalCount] = await Promise.all([
    prismaClient.user.findMany({
      where,
      take,
      skip,
      select: ligneUtilisateurSelect,
      orderBy: [...orderBy, { lastName: 'asc' }],
    }),
    prismaClient.user.count({ where }),
    prismaClient.user.count(),
  ])

  return {
    totalCount,
    matchesCount,
    lignesParPage,
    utilisateurs: lignes.map((ligne) =>
      ligneUtilisateurToDomain(ligne, maintenant),
    ),
  }
}
