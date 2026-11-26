import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '../../../../domain'
import type { SupprimerLActiviteDeCoordination } from '../../domain'

export const supprimerLActiviteDeCoordination =
  (auteurId: UtilisateurId): SupprimerLActiviteDeCoordination =>
  async ({ id, type }) => {
    const maintenant = new Date()
    await prismaClient.$transaction([
      prismaClient.activitesCoordinationTags.deleteMany({
        where: { activiteCoordinationId: id },
      }),
      prismaClient.activiteCoordination.update({
        where: { id },
        data: { suppression: maintenant, modification: maintenant },
      }),
    ])

    addMutationLog({
      userId: auteurId,
      nom: 'SupprimerActiviteCoordination',
      data: { type, id },
    })
  }
