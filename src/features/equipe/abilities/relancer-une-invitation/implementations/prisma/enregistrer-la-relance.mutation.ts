import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { EnregistrerLaRelance } from '../../domain/ports'

export const enregistrerLaRelance: EnregistrerLaRelance<
  CleDInvitation
> = async ({ cle, reference, auteurId, renvoyeeLe }) => {
  await prismaClient.invitationEquipe.update({
    where: cle,
    data: { renvoyee: renvoyeeLe },
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
