import { prismaClient } from '@/configuration/prisma'
import { CoordinateurId, MediateurId, UtilisateurId } from '../../../../domain'
import type { LireLePartage } from '../../domain/ports'

const compteActif = { user: { deleted: null } }

export const lireLePartage: LireLePartage = async (id) => {
  const partage = await prismaClient.partageStatistiques.findFirst({
    where: {
      id,
      deleted: null,
      OR: [{ mediateur: compteActif }, { coordinateur: compteActif }],
    },
    select: {
      mediateur: { select: { id: true, userId: true } },
      coordinateur: { select: { id: true, userId: true } },
    },
  })

  return partage === null
    ? null
    : {
        mediateur:
          partage.mediateur === null
            ? null
            : {
                mediateurId: MediateurId(partage.mediateur.id),
                utilisateurId: UtilisateurId(partage.mediateur.userId),
              },
        coordinateur:
          partage.coordinateur === null
            ? null
            : {
                coordinateurId: CoordinateurId(partage.coordinateur.id),
                utilisateurId: UtilisateurId(partage.coordinateur.userId),
              },
      }
}
