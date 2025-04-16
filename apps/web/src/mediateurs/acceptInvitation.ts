import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { sendAcceptInvitation } from './sendAcceptInvitation'

export const acceptInvitation = async (invitation: {
  coordinateurId: string
  email: string
  coordinateur: { user: { email: string } }
  mediateurInvite: { id: string; user: { email: string } } | null
}) => {
  await prismaClient.invitationEquipe.update({
    where: {
      email_coordinateurId: {
        email: invitation.email,
        coordinateurId: invitation.coordinateurId,
      },
    },
    data: {
      acceptee: new Date(),
    },
  })

  if (invitation.mediateurInvite != null) {
    await prismaClient.mediateurCoordonne.upsert({
      where: {
        coordinateurId_mediateurId: {
          mediateurId: invitation.mediateurInvite.id,
          coordinateurId: invitation.coordinateurId,
        },
      },
      create: {
        id: v4(),
        mediateurId: invitation.mediateurInvite.id,
        coordinateurId: invitation.coordinateurId,
      },
      update: {
        suppression: null,
      },
    })
  }

  await sendAcceptInvitation({
    email: invitation.coordinateur.user.email,
    mediateur: invitation.mediateurInvite?.user.email ?? invitation.email,
  })
}
