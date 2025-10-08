import { SessionUser } from '@app/web/auth/sessionUser'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'
import { TagScope } from '../../tagScope'

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
              OR: [
                ...(sessionUser.mediateur?.id
                  ? [{ mediateurId: sessionUser.mediateur.id }]
                  : []),
              ],
            },
          },
        },
      })
    }

    const departement = getUserDepartement(sessionUser)
    if (scope === TagScope.Departemental && !departement) {
      throw new Error('No departement found for user')
    }

    return prismaClient.tag.update({
      where: { id },
      data: {
        ...data,
        mediateurId:
          scope === TagScope.Personnel && sessionUser.mediateur?.id
            ? sessionUser.mediateur.id
            : null,
        coordinateurId:
          scope === TagScope.Personnel && sessionUser.coordinateur?.id
            ? sessionUser.coordinateur.id
            : null,
        departement:
          scope === TagScope.Departemental ? departement?.code : null,
        modification: new Date(),
      },
    })
  }
