import { prismaClient } from '@/configuration/prisma'

const estMediateur = (
  user: { email: string; mediateur: { id: string } | null } | null,
): user is { email: string; mediateur: { id: string } } =>
  user?.mediateur?.id != null

export const accepterLesInvitationsEnAttente = async (
  userId: string,
): Promise<void> => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      mediateur: { select: { id: true } },
    },
  })

  if (!estMediateur(user)) return

  await prismaClient.invitationEquipe.updateMany({
    where: { email: user.email, acceptee: null, refusee: null },
    data: { acceptee: new Date(), mediateurId: user.mediateur.id },
  })

  const invitations = await prismaClient.invitationEquipe.findMany({
    where: { email: user.email, acceptee: { not: null } },
  })

  await prismaClient.mediateurCoordonne.createMany({
    data: invitations.map((invitation) => ({
      coordinateurId: invitation.coordinateurId,
      mediateurId: user.mediateur.id,
    })),
    skipDuplicates: true,
  })
}
