import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { EnregistrerLaRelance } from '../../domain/relancer-une-invitation'

export const enregistrerLaRelance: EnregistrerLaRelance<
  CleDInvitation
> = async ({ cle, reference, auteurId, maintenant }) => {
  await prismaClient.invitationEquipe.update({
    where: cle,
    data: { renvoyee: maintenant },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'RenvoyerInvitationMediateurCoordonne',
    data: {
      email: reference.email,
      coordinateurId: reference.coordinateurId,
    },
  })
}
