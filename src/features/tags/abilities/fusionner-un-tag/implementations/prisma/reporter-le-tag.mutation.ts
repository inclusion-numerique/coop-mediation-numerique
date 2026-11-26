import { prismaClient } from '@/configuration/prisma'
import type { ReporterLeTag } from '../../domain/fusionner-un-tag'

export const reporterLeTag: ReporterLeTag = async ({
  sourceId,
  destinationId,
}) => {
  await prismaClient.$transaction(async (transaction) => {
    const activites = await transaction.activitesTags.findMany({
      where: { tagId: sourceId },
      select: { activiteId: true },
    })
    await transaction.activitesTags.createMany({
      data: activites.map(({ activiteId }) => ({
        activiteId,
        tagId: destinationId,
      })),
      skipDuplicates: true,
    })
    await transaction.activitesTags.deleteMany({ where: { tagId: sourceId } })

    const activitesDeCoordination =
      await transaction.activitesCoordinationTags.findMany({
        where: { tagId: sourceId },
        select: { activiteCoordinationId: true },
      })
    await transaction.activitesCoordinationTags.createMany({
      data: activitesDeCoordination.map(({ activiteCoordinationId }) => ({
        activiteCoordinationId,
        tagId: destinationId,
      })),
      skipDuplicates: true,
    })
    await transaction.activitesCoordinationTags.deleteMany({
      where: { tagId: sourceId },
    })

    await transaction.tag.delete({ where: { id: sourceId } })
  })
}
