import { prismaClient } from '@app/web/prismaClient'
import { UserProfile } from '@app/web/utils/user'

export const getPartageStatistiquesId = async ({
  user,
}: {
  user: UserProfile
}) => {
  if (!user.mediateur?.id && !user.coordinateur?.id) {
    return undefined
  }

  if (user.mediateur?.id) {
    const partageStatistiques =
      await prismaClient.partageStatistiques.findUnique({
        where: { mediateurId: user.mediateur?.id, deleted: null },
        select: { id: true },
      })
    return partageStatistiques?.id
  }

  if (user.coordinateur?.id) {
    const partageStatistiques =
      await prismaClient.partageStatistiques.findUnique({
        where: { coordinateurId: user.coordinateur?.id, deleted: null },
        select: { id: true },
      })
    return partageStatistiques?.id
  }
}

export type PartageStatistiquesId = Awaited<
  ReturnType<typeof getPartageStatistiquesId>
>
