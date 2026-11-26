import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { ArchiverLAdhesion } from '../../domain/ports'

export const archiverLAdhesion: ArchiverLAdhesion = async ({
  adhesion,
  auteurId,
}) => {
  await prismaClient.mediateurCoordonne.update({
    where: { id: adhesion.id },
    data: {
      suppression: adhesion.archiveeLe,
      modification: adhesion.archiveeLe,
    },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'SupprimerMediateurCoordonne',
    data: {
      mediateurId: adhesion.mediateurId,
      coordinateurId: adhesion.coordinateurId,
    },
  })
}
