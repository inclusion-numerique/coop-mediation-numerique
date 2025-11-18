import { SessionUser } from '@app/web/auth/sessionUser'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'
import { enforceIsCoordinateur } from '@app/web/server/rpc/enforceIsCoordinateur'

export const createTagDepartemental =
  (sessionUser: SessionUser) =>
  async ({
    nom,
    description,
  }: {
    nom: string
    description?: string | null
  }) => {
    enforceIsCoordinateur(sessionUser)
    const departement = getUserDepartement(sessionUser)

    if (!departement) throw new Error('No departement found for user')

    return prismaClient.tag.create({
      data: {
        nom,
        description,
        departement: departement.code,
        mediateurId: null,
        coordinateurId: null,
      },
    })
  }
