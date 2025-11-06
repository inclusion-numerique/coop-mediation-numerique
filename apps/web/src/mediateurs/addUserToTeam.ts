import { prismaClient } from '@app/web/prismaClient'

export const addUserToTeam = async ({
  userId,
  coordinateurId,
}: {
  userId: string
  coordinateurId: string
}) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      mediateur: {
        select: {
          id: true,
        },
      },
    },
  })

  const mediateur = user?.mediateur
  if (!mediateur) {
    throw new Error('User not found or is not a mediateur')
  }

  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: {
      id: coordinateurId,
    },
  })

  if (!coordinateur) {
    throw new Error('Coordinateur not found')
  }

  const result = await prismaClient.$transaction(async (transaction) => {
    // Add to team
    const mediateurCoordonne = await transaction.mediateurCoordonne.create({
      data: {
        mediateurId: mediateur.id,
        coordinateurId,
      },
    })

    // Remove existing invitations
    // - that concerns the mediateur
    // - and that is pending
    await transaction.invitationEquipe.deleteMany({
      where: {
        OR: [
          {
            mediateurId: mediateur.id,
          },
          {
            email: user.email,
          },
        ],
        acceptee: null,
        refusee: null,
      },
    })
    return mediateurCoordonne
  })

  return {
    mediateurCoordonne: result,
  }
}
