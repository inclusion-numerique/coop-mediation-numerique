import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '../../../../domain'
import type { SupprimerLActiviteDeCoordination } from '../../domain'

export const supprimerLActiviteDeCoordination =
  (auteurId: UtilisateurId): SupprimerLActiviteDeCoordination =>
  async ({ activite: { id, type }, suppression }) => {
    await prismaClient.$transaction([
      prismaClient.activitesCoordinationTags.deleteMany({
        where: { activiteCoordinationId: id },
      }),
      prismaClient.activiteCoordination.update({
        where: { id },
        data: { suppression, modification: suppression },
      }),
    ])

    addMutationLog({
      userId: auteurId,
      nom: 'SupprimerActiviteCoordination',
      data: { type, id },
    })
  }
