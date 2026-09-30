import { prismaClient } from '@app/web/prismaClient'
import { invalidError, notFoundError } from '@app/web/server/rpc/trpcErrors'

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

  if (!user) {
    throw notFoundError('Utilisateur introuvable')
  }

  const { mediateur } = user
  if (!mediateur) {
    throw invalidError(
      `${user.email} n’est pas médiateur : son inscription n’est pas terminée. Vérifiez s’il possède un autre compte.`,
    )
  }

  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: {
      id: coordinateurId,
    },
  })

  if (!coordinateur) {
    throw notFoundError('Coordinateur introuvable')
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
