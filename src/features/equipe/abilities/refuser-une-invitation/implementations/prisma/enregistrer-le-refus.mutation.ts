import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { EnregistrerLeRefus } from '../../domain/refuser-une-invitation'

export const enregistrerLeRefus: EnregistrerLeRefus<CleDInvitation> = async ({
  cle,
  reference,
  auteurId,
  maintenant,
}) => {
  await prismaClient.invitationEquipe.update({
    where: cle,
    data: { refusee: maintenant },
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
