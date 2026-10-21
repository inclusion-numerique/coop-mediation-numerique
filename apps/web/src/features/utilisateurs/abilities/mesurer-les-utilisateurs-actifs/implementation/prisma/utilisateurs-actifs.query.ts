import { conseillerNumeriqueWhere } from '@app/web/features/employeuse/server'
import { utilisateursWhere } from '@app/web/features/utilisateurs/db/utilisateurs.where'
import {
  AUCUN_FILTRE,
  FiltreStatut,
} from '@app/web/features/utilisateurs/domain'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  actifsDeLaCategorie,
  type CategorieStatistique,
  type UtilisateursActifs,
  utilisateursActifs,
} from '../../domain'

const inscritVivant = {
  role: 'User',
  deleted: null,
  inscriptionValidee: { not: null },
} satisfies Prisma.UserWhereInput

const whereDeLaCategorie: Record<CategorieStatistique, Prisma.UserWhereInput> =
  {
    mediateurs: {
      mediateur: { isNot: null },
      coordinateur: { is: null },
      ...conseillerNumeriqueWhere(false),
    },
    conseillers: {
      mediateur: { isNot: null },
      coordinateur: { is: null },
      ...conseillerNumeriqueWhere(true),
    },
    coordinateurs: { coordinateur: { isNot: null } },
  }

const compter = async (categorie: CategorieStatistique, maintenant: Date) => {
  const actif = utilisateursWhere({
    mots: [],
    filtres: { ...AUCUN_FILTRE, statut: FiltreStatut('actif') },
    maintenant,
  })

  const [total, actifs] = await Promise.all([
    prismaClient.user.count({
      where: { AND: [inscritVivant, whereDeLaCategorie[categorie]] },
    }),
    prismaClient.user.count({
      where: { AND: [actif, whereDeLaCategorie[categorie]] },
    }),
  ])

  return actifsDeLaCategorie({ actifs, total })
}

export const mesurerLesUtilisateursActifs = async (
  maintenant: Date,
): Promise<UtilisateursActifs> => {
  const [mediateurs, conseillers, coordinateurs] = await Promise.all([
    compter('mediateurs', maintenant),
    compter('conseillers', maintenant),
    compter('coordinateurs', maintenant),
  ])

  return utilisateursActifs({ mediateurs, conseillers, coordinateurs })
}
