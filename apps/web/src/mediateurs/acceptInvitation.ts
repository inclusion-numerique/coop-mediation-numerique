import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { sendAcceptInvitation } from './sendAcceptInvitation'

export const acceptInvitation = async (invitation: {
  coordinateurId: string
  email: string
  coordinateur: { user: { email: string } }
  mediateurInvite: { id: string; user: { email: string } } | null
}) => {
  await prismaClient.$transaction(async (transaction) => {
    await transaction.invitationEquipe.update({
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
      const existing = await transaction.mediateurCoordonne.findFirst({
        where: {
          mediateurId: invitation.mediateurInvite.id,
          coordinateurId: invitation.coordinateurId,
          suppression: null,
        },
      })

      if (existing) {
        return existing
      }

      await transaction.mediateurCoordonne.create({
        data: {
          id: v4(),
          mediateurId: invitation.mediateurInvite.id,
          coordinateurId: invitation.coordinateurId,
        },
      })
    }
  })

  await sendAcceptInvitation({
    email: invitation.coordinateur.user.email,
    mediateur: invitation.mediateurInvite?.user.email ?? invitation.email,
  })
}
