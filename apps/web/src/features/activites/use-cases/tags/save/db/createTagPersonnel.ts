import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { prismaClient } from '@app/web/prismaClient'

const createTag = async (data: {
  nom: string
  description?: string | null
  mediateurId?: string
  coordinateurId?: string
}) => {
  return prismaClient.tag.create({
    data: {
      ...data,
      departement: null,
    },
  })
}

export const createTagPersonnel =
  (sessionUser: SessionUser) =>
  async ({
    nom,
    description,
  }: {
    nom: string
    description?: string | null
  }) => {
    const data = { nom, description }

    if (isMediateur(sessionUser))
      return createTag({ ...data, mediateurId: sessionUser.mediateur.id })

    if (isCoordinateur(sessionUser))
      return createTag({ ...data, coordinateurId: sessionUser.coordinateur.id })

    throw new Error('User not allowed to create tag')
  }
