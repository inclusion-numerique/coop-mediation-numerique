import { prismaClient } from '@app/web/prismaClient'
import { UserProfile } from '@app/web/utils/user'

export const getPartageStatistiquesId = async ({
  user,
}: {
  user: UserProfile
}) => {
  if (!user.mediateur?.id) {
    return undefined
  }

  const userMediateurId = user.mediateur.id

  const partageStatistiques = await prismaClient.partageStatistiques.findUnique(
    {
      where: { mediateurId: userMediateurId, deleted: null },
      select: { id: true },
    },
  )

  return partageStatistiques?.id
}

export type PartageStatistiquesId = Awaited<
  ReturnType<typeof getPartageStatistiquesId>
>
