import { prismaClient } from '@app/web/prismaClient'

/**
 * Révoque les liens de partage de statistiques d'un compte, des deux côtés :
 * celui qu'il a ouvert comme médiateur, et celui qu'il a ouvert comme
 * coordinateur.
 *
 * Un lien de partage est une URL publique : la laisser vivre après la
 * suppression du compte, c'est laisser consultables les statistiques de
 * quelqu'un qui n'est plus là.
 *
 * Idempotent : le filtre `deleted: null` rend le second passage vide.
 */
export const revoquerPartageStatistiques = async ({
  mediateurId,
  coordinateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly maintenant?: Date
}): Promise<{ readonly partagesRevoques: number }> => {
  const proprietaires = [
    ...(mediateurId === null ? [] : [{ mediateurId }]),
    ...(coordinateurId === null ? [] : [{ coordinateurId }]),
  ]

  if (proprietaires.length === 0) return { partagesRevoques: 0 }

  const { count } = await prismaClient.partageStatistiques.updateMany({
    where: { deleted: null, OR: proprietaires },
    data: { deleted: maintenant },
  })

  return { partagesRevoques: count }
}
