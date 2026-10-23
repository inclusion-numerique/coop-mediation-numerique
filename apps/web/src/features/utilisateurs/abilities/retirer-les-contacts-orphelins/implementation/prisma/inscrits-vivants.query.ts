import { inscritVivantWhere } from '@app/web/features/utilisateurs/db/inscrit-vivant.where'
import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

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
