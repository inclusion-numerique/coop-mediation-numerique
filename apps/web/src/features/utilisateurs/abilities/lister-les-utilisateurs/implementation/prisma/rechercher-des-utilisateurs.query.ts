import {
  ligneUtilisateurSelect,
  ligneUtilisateurToDomain,
} from '@app/web/features/utilisateurs/db/ligne-utilisateur.transfer'
import { utilisateursWhere } from '@app/web/features/utilisateurs/db/utilisateurs.where'
import type { FiltresUtilisateurs } from '@app/web/features/utilisateurs/domain'
import type { Prisma } from '@app/web/generated/prisma/client'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'
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
  const { take, skip } = takeAndSkipFromPage({
    page: toNumberOr(searchParams.page)(DEFAULT_PAGE),
    pageSize: toNumberOr(searchParams.lignes)(LIGNES_PAR_PAGE),
  })

  const where = utilisateursWhere({
    mots: toQueryParts(searchParams).filter((mot) => mot !== ''),
    filtres,
    maintenant,
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
    totalPages: take ? Math.ceil(matchesCount / take) : 1,
    utilisateurs: lignes.map((ligne) =>
      ligneUtilisateurToDomain(ligne, maintenant),
    ),
  }
}
