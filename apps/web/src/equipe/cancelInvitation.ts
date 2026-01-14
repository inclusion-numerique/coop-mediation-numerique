import { prismaClient } from '@app/web/prismaClient'

export const cancelInvitation = async ({
  email,
  coordinateurId,
}: {
  email: string
  coordinateurId: string
}) => {
  const invitation = await prismaClient.invitationEquipe.findUnique({
    where: {
      email_coordinateurId: {
        email,
        coordinateurId,
      },
    },
    select: {
      acceptee: true,
    },
  })

  if (invitation == null) {
    throw new Error('Invitation not found')
  }

  if (invitation.acceptee != null) {
    throw new Error('Invitation already accepted')
  }

  await prismaClient.invitationEquipe.delete({
    where: {
      email_coordinateurId: {
        email,
        coordinateurId,
      },
    },
  })
}
