import { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import { UserProfile } from '@app/web/utils/user'

export const getHasCrasV1 = async ({
  user,
  mediateurIds: otherMediateurIds,
  activitesFilters: _activitesFilters,
}: {
  user: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters?: ActivitesFilters
}) => {
  if (!user) {
    return { hasCrasV1: false }
  }

  // If the user is a coordinateur, we assume that they have cras v1 somewhere in their team
  // so we will display cras v1 ui. also they know about v1 so this is ok.
  if (user?.coordinateur?.id) return { hasCrasV1: true }

  const userMediateurId = user.mediateur?.id

  const mediateurIds = userMediateurId
    ? [userMediateurId, ...(otherMediateurIds ?? [])]
    : (otherMediateurIds ?? [])

  if (mediateurIds.length === 0) return { hasCrasV1: false }

  const activite = await prismaClient.activite.findFirst({
    where: {
      mediateurId: { in: mediateurIds },
      v1CraId: { not: null },
    },
    select: { id: true },
  })

  return { hasCrasV1: Boolean(activite) }
}

export type HasCrasV1 = Awaited<ReturnType<typeof getHasCrasV1>>
