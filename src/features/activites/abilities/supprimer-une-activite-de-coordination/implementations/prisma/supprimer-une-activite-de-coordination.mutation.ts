import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '../../../../domain'
import type { SupprimerLActiviteDeCoordination } from '../../domain'

export const supprimerLActiviteDeCoordination =
  (auteurId: UtilisateurId): SupprimerLActiviteDeCoordination =>
  async ({ activite: { id, type, coordinateurId }, suppression }) => {
    await prismaClient.$transaction([
      prismaClient.activitesCoordinationTags.deleteMany({
        where: {
          activiteCoordinationId: id,
          activiteCoordination: { coordinateurId, suppression: null },
        },
      }),
      prismaClient.activiteCoordination.updateMany({
        where: { id, coordinateurId, suppression: null },
        data: { suppression, modification: suppression },
      }),
    ])

    addMutationLog({
      userId: auteurId,
      nom: 'SupprimerActiviteCoordination',
      data: { type, id },
    })
  }
