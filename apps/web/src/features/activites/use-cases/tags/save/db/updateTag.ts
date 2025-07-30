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
              mediateurId: sessionUser.mediateur?.id ?? '',
            },
          },
        },
      })
    }

    return await prismaClient.tag.update({
      where: { id },
      data: {
        ...data,
        mediateurId:
          scope === TagScope.Personnel
            ? (sessionUser.mediateur?.id ?? null)
            : null,
        departement:
          scope === TagScope.Departemental
            ? getUserDepartement(sessionUser).code
            : null,
        modification: new Date(),
      },
    })
  }
