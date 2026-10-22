import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const inscritsVivantsParmi = async (
  identifiants: readonly UtilisateurId[],
): Promise<ReadonlySet<UtilisateurId>> =>
  new Set(
    (
      await prismaClient.user.findMany({
        where: {
          id: { in: [...identifiants] },
          deleted: null,
          inscriptionValidee: { not: null },
        },
        select: { id: true },
      })
    ).map(({ id }) => UtilisateurId(id)),
  )
