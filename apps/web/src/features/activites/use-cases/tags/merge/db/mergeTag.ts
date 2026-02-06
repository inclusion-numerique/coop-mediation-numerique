import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

type Transaction = Prisma.TransactionClient

const getActiviteIdsLinkedToTag = async (tx: Transaction, tagId: string) => {
  const activites = await tx.activitesTags.findMany({
    where: { tagId },
    select: { activiteId: true },
  })
  return activites.map((a) => a.activiteId)
}

const linkActivitesToTag = async (
  tx: Transaction,
  activiteIds: string[],
  tagId: string,
) => {
  if (activiteIds.length === 0) return

  await tx.activitesTags.createMany({
    data: activiteIds.map((activiteId) => ({ activiteId, tagId })),
  })
}

const unlinkAllActivitesFromTag = (tx: Transaction, tagId: string) =>
  tx.activitesTags.deleteMany({ where: { tagId } })

const transferActivitesToDestination = async (
  tx: Transaction,
  sourceTagId: string,
  destinationTagId: string,
) => {
  const sourceActiviteIds = await getActiviteIdsLinkedToTag(tx, sourceTagId)
  const destinationActiviteIds = new Set(
    await getActiviteIdsLinkedToTag(tx, destinationTagId),
  )

  const newActiviteIds = sourceActiviteIds.filter(
    (id) => !destinationActiviteIds.has(id),
  )

  await linkActivitesToTag(tx, newActiviteIds, destinationTagId)
  await unlinkAllActivitesFromTag(tx, sourceTagId)
}

const getCoordinationActiviteIdsLinkedToTag = async (
  tx: Transaction,
  tagId: string,
) => {
  const activites = await tx.activitesCoordinationTags.findMany({
    where: { tagId },
    select: { activiteCoordinationId: true },
  })
  return activites.map((a) => a.activiteCoordinationId)
}

const linkCoordinationActivitesToTag = async (
  tx: Transaction,
  activiteCoordinationIds: string[],
  tagId: string,
) => {
  if (activiteCoordinationIds.length === 0) return

  await tx.activitesCoordinationTags.createMany({
    data: activiteCoordinationIds.map((activiteCoordinationId) => ({
      activiteCoordinationId,
      tagId,
    })),
  })
}

const unlinkAllCoordinationActivitesFromTag = (
  tx: Transaction,
  tagId: string,
) => tx.activitesCoordinationTags.deleteMany({ where: { tagId } })

const transferCoordinationActivitesToDestination = async (
  tx: Transaction,
  sourceTagId: string,
  destinationTagId: string,
) => {
  const sourceActiviteIds = await getCoordinationActiviteIdsLinkedToTag(
    tx,
    sourceTagId,
  )
  const destinationActiviteIds = new Set(
    await getCoordinationActiviteIdsLinkedToTag(tx, destinationTagId),
  )

  const newActiviteIds = sourceActiviteIds.filter(
    (id) => !destinationActiviteIds.has(id),
  )

  await linkCoordinationActivitesToTag(tx, newActiviteIds, destinationTagId)
  await unlinkAllCoordinationActivitesFromTag(tx, sourceTagId)
}

const deleteTag = (tx: Transaction, tagId: string) =>
  tx.tag.delete({ where: { id: tagId } })

export const mergeTag = (sourceTagId: string, destinationTagId: string) =>
  prismaClient.$transaction(async (tx) => {
    await transferActivitesToDestination(tx, sourceTagId, destinationTagId)
    await transferCoordinationActivitesToDestination(
      tx,
      sourceTagId,
      destinationTagId,
    )
    await deleteTag(tx, sourceTagId)

    return tx.tag.findUnique({ where: { id: destinationTagId } })
  })
