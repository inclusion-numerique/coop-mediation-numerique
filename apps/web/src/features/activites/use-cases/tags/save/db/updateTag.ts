import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'
import { TagScope } from '../../tagScope'

const updateTagDepartemental =
  (id: string) =>
  async (data: {
    nom: string
    description?: string | null
    mediateurId?: string | null
    coordinateurId?: string | null
    departement?: string
  }) => {
    if (!data.departement) {
      throw new Error('No departement found for user')
    }

    return prismaClient.tag.update({
      where: { id },
      data: {
        ...data,
        modification: new Date(),
        mediateurId: null,
        coordinateurId: null,
      },
    })
  }

const updateTagEquipe =
  (id: string) => async (data: { nom: string; description?: string | null }) =>
    prismaClient.tag.update({
      where: { id },
      data: {
        ...data,
        modification: new Date(),
      },
    })

const updateTagPersonnel =
  (id: string) =>
  async (data: {
    nom: string
    description?: string | null
    mediateurId?: string | null
    coordinateurId?: string | null
  }) => {
    if (data.mediateurId == null && data.coordinateurId == null) {
      throw new Error('Either mediateurId or coordinateurId must be provided')
    }

    return prismaClient.tag.update({
      where: { id },
      data: {
        ...data,
        modification: new Date(),
        departement: null,
      },
    })
  }

export const updateTag =
  (sessionUser: SessionUser) =>
  async ({
    id,
    scope,
    ...data
  }: {
    id: string
    scope: TagScope
    nom: string
    description?: string | null
  }) => {
    if (scope === TagScope.Personnel) {
      await prismaClient.activitesTags.deleteMany({
        where: {
          tagId: id,
          activite: {
            NOT: {
              ...(sessionUser.mediateur?.id
                ? { mediateurId: sessionUser.mediateur.id }
                : {}),
            },
          },
        },
      })
    }

    if (scope === TagScope.Personnel && isMediateur(sessionUser))
      return updateTagPersonnel(id)({
        ...data,
        mediateurId: sessionUser.mediateur.id,
        coordinateurId: null,
      })

    if (scope === TagScope.Personnel && isCoordinateur(sessionUser))
      return updateTagPersonnel(id)({
        ...data,
        mediateurId: null,
        coordinateurId: sessionUser.coordinateur.id,
      })

    if (scope === TagScope.Departemental && isCoordinateur(sessionUser))
      return updateTagDepartemental(id)({
        ...data,
        departement: getUserDepartement(sessionUser)?.code,
      })

    if (scope === TagScope.Equipe) return updateTagEquipe(id)(data)
  }
