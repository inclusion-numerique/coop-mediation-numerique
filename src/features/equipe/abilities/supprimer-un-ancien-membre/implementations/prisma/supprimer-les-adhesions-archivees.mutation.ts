import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SupprimerLesAdhesionsArchivees } from '../../domain/ports'

export const supprimerLesAdhesionsArchivees: SupprimerLesAdhesionsArchivees =
  async ({ adhesions, mediateurId, coordinateurId, auteurId }) => {
    await prismaClient.mediateurCoordonne.deleteMany({
      where: {
        id: { in: adhesions.map(({ id }) => id) },
        suppression: { not: null },
      },
    })

    addMutationLog({
      userId: auteurId,
      nom: 'SupprimerDefinitivementMediateurCoordonne',
      data: { mediateurId, coordinateurId },
    })
  }
