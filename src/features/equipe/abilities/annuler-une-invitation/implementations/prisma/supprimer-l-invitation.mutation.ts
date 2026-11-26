import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { SupprimerLInvitation } from '../../domain/annuler-une-invitation'

export const supprimerLInvitation: SupprimerLInvitation<
  CleDInvitation
> = async ({ cle, reference, auteurId }) => {
  await prismaClient.invitationEquipe.delete({ where: cle })

  addMutationLog({
    userId: auteurId,
    nom: 'AnnulerInvitationMediateurCoordonne',
    data: { email: reference.email, coordinateurId: reference.coordinateurId },
  })
}
