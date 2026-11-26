import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { SupprimerLesAdhesionsArchivees } from '../../domain/supprimer-un-ancien-membre'

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
