import { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import { UserProfile } from '@app/web/utils/user'
import { Prisma } from '@prisma/client'

export const getHasCrasV1 = async ({
  user,
  mediateurIds: otherMediateurIds,
  activitesFilters: _activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
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

  const rows = await prismaClient.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM "activites"
      WHERE "mediateur_id" IN (${Prisma.join(mediateurIds)})
        AND "v1_cra_id" IS NOT NULL
      LIMIT 1
    ) AS "exists"
  `

  return { hasCrasV1: rows[0]?.exists ?? false }
}

export type HasCrasV1 = Awaited<ReturnType<typeof getHasCrasV1>>
