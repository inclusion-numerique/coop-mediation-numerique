import { prismaClient } from '@/configuration/prisma/prismaClient'
import { enPosteWhere } from '@/features/utilisateurs/db/conseiller-numerique-en-poste'
import { utilisateursWhere } from '@/features/utilisateurs/db/utilisateurs.where'
import { SANS_ANCIENS_RATTACHEMENTS } from '@/features/utilisateurs/db/utilisateurs-rattaches.query'
import { AUCUN_FILTRE, FiltreStatut } from '@/features/utilisateurs/domain'
import type { Prisma } from '@/generated/prisma/client'
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
      ...enPosteWhere(false),
    },
    conseillers: {
      mediateur: { isNot: null },
      coordinateur: { is: null },
      ...enPosteWhere(true),
    },
    coordinateurs: { coordinateur: { isNot: null } },
  }

const compter = async (categorie: CategorieStatistique, maintenant: Date) => {
  const actif = utilisateursWhere({
    mots: [],
    filtres: { ...AUCUN_FILTRE, statut: FiltreStatut('actif') },
    maintenant,
    rattaches: SANS_ANCIENS_RATTACHEMENTS,
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
