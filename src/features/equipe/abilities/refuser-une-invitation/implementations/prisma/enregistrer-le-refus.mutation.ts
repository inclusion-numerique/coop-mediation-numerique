import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { EnregistrerLeRefus } from '../../domain/ports'

export const enregistrerLeRefus: EnregistrerLeRefus<CleDInvitation> = async ({
  cle,
  reference,
  auteurId,
  refuseeLe,
}) => {
  await prismaClient.invitationEquipe.update({
    where: cle,
    data: { refusee: refuseeLe },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'RefuserInvitationMediateurCoordonne',
    data: {
      email: reference.email,
      coordinateurId: reference.coordinateurId,
    },
  })
}
