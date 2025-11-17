import { prismaClient } from '@app/web/prismaClient'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { sendInviteMediateurEmail } from './sendInviteMediateurEmail'
import { sendInviteNewMediateurEmail } from './sendInviteNewMediateurEmail'

export const resendInvitation = async ({
  email,
  coordinateurId,
  coordinateurName,
}: {
  email: string
  coordinateurId: string
  coordinateurName: string
}) => {
  const invitation = await prismaClient.invitationEquipe.findUnique({
    where: {
      email_coordinateurId: {
        email,
        coordinateurId,
      },
    },
    select: {
      mediateurId: true,
      acceptee: true,
      refusee: true,
    },
  })

  if (invitation == null) {
    throw new Error('Invitation not found')
  }

  if (invitation.acceptee != null) {
    throw new Error('Invitation already accepted')
  }

  if (invitation.refusee != null) {
    throw new Error('Invitation already refused')
  }

  const invitationData = {
    url: `/invitations/${encodeSerializableState({ email, coordinateurId })}`,
    email,
    from: { name: coordinateurName },
  }

  if (invitation.mediateurId == null) {
    await sendInviteNewMediateurEmail(invitationData)
  } else {
    await sendInviteMediateurEmail(invitationData)
  }

  await prismaClient.invitationEquipe.update({
    where: {
      email_coordinateurId: {
        email,
        coordinateurId,
      },
    },
    data: {
      renvoyee: new Date(),
    },
  })
}
