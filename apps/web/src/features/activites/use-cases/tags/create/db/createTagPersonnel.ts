import { SessionUser } from '@app/web/auth/sessionUser'
import { prismaClient } from '@app/web/prismaClient'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'

export const createTagPersonnel =
  (sessionUser: SessionUser) =>
  async ({
    nom,
    description,
  }: {
    nom: string
    description?: string | null
  }) => {
    enforceIsMediateur(sessionUser)
    await prismaClient.tag.create({
      data: {
        nom,
        description,
        mediateurId: sessionUser.mediateur.id,
      },
    })
  }
