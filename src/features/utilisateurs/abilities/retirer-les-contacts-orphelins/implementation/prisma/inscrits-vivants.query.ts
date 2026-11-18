import { prismaClient } from '@/configuration/prisma/prismaClient'
import { inscritVivantWhere } from '@/features/utilisateurs/db/inscrit-vivant.where'
import { UtilisateurId } from '@/features/utilisateurs/domain'

export const inscritsVivantsParmi = async (
  identifiants: readonly UtilisateurId[],
): Promise<ReadonlySet<UtilisateurId>> =>
  new Set(
    (
      await prismaClient.user.findMany({
        where: { id: { in: [...identifiants] }, ...inscritVivantWhere },
        select: { id: true },
      })
    ).map(({ id }) => UtilisateurId(id)),
  )
