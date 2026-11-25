import { prismaClient } from '@/configuration/prisma'
import { AUCUN_FILTRE, FiltreStatut } from '@/features/utilisateurs/domain'
import { enPosteWhere } from '@/features/utilisateurs/implementations/prisma/conseiller-numerique-en-poste.where'
import { utilisateursWhere } from '@/features/utilisateurs/implementations/prisma/utilisateurs.where'
import { SANS_ANCIENS_RATTACHEMENTS } from '@/features/utilisateurs/implementations/prisma/utilisateurs-rattaches.query'
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
