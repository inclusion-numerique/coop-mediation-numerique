import { prismaClient } from '@/configuration/prisma'
import type { CoordinateurId, MediateurId } from '@/features/mediateurs/domain'

export const revoquerPartageStatistiques = async ({
  mediateurId,
  coordinateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
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
