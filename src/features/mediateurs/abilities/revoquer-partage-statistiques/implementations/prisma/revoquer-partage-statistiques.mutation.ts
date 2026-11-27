import { prismaClient } from '@/configuration/prisma'
import { partageDuProprietaire } from '../../../../implementations/prisma/partage-du-proprietaire.query'
import type { RevoquerLesPartages } from '../../domain/ports'

export const revoquerLesPartages: RevoquerLesPartages = async ({
  proprietaires,
  revoqueLe,
}) => {
  const { count } = await prismaClient.partageStatistiques.updateMany({
    where: { deleted: null, OR: proprietaires.map(partageDuProprietaire) },
    data: { deleted: revoqueLe },
  })

  return { partagesRevoques: count }
}
