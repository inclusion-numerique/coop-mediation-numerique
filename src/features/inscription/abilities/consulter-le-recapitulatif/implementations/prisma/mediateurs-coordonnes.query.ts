import { prismaClient } from '@/configuration/prisma'
import type { CompterLesMediateursCoordonnes } from '@/features/inscription/abilities/consulter-le-recapitulatif/domain'

export const compterLesMediateursCoordonnes: CompterLesMediateursCoordonnes = (
  utilisateurId,
) =>
  prismaClient.mediateurCoordonne.count({
    where: { coordinateur: { userId: utilisateurId }, suppression: null },
  })
