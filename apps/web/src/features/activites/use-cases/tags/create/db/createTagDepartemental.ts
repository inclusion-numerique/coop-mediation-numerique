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

    await prismaClient.tag.create({
      data: {
        nom,
        description,
        departement: getUserDepartement(sessionUser).code,
      },
    })
  }
