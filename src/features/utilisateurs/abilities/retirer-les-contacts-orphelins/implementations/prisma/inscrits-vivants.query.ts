import { prismaClient } from '@/configuration/prisma'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { inscritVivantWhere } from '@/features/utilisateurs/implementations/prisma/inscrit-vivant.where'

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
