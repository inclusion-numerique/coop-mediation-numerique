import type { Page, PageSize, Sort } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import {
  ligneUtilisateurSelect,
  ligneUtilisateurToDomain,
} from '@/features/utilisateurs/implementations/prisma/ligne-utilisateur.transfer'
import { utilisateursWhere } from '@/features/utilisateurs/implementations/prisma/utilisateurs.where'
import { utilisateursRattaches } from '@/features/utilisateurs/implementations/prisma/utilisateurs-rattaches.query'
import type { ColonneTriable, UtilisateursTrouves } from '../../domain'
import { ordreDesUtilisateurs } from './tri-des-utilisateurs.order-by'

export const rechercherDesUtilisateurs = async ({
  mots,
  filtres,
  tri,
  page,
  pageSize,
  maintenant,
}: {
  readonly mots: readonly string[]
  readonly filtres: FiltresUtilisateurs
  readonly tri: Sort<ColonneTriable>
  readonly page: Page
  readonly pageSize: PageSize
  readonly maintenant: Date
}): Promise<UtilisateursTrouves> => {
  const where = utilisateursWhere({
    mots,
    filtres,
    maintenant,
    rattaches: await utilisateursRattaches(filtres),
  })

  const [lignes, matchesCount, totalCount] = await Promise.all([
    prismaClient.user.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: ligneUtilisateurSelect,
      orderBy: [...ordreDesUtilisateurs(tri), { lastName: 'asc' }],
    }),
    prismaClient.user.count({ where }),
    prismaClient.user.count(),
  ])

  return {
    totalCount,
    totalItems: matchesCount,
    currentPage: page,
    pageSize,
    items: lignes.map((ligne) => ligneUtilisateurToDomain(ligne, maintenant)),
  }
}
