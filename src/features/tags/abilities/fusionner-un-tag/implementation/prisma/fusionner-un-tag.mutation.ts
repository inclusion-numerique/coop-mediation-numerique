import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { tagToDomain } from '../../../../db/tag.transfer'
import {
  type Acteur,
  ActionNonAutorisee,
  DestinationNonAutorisee,
  peutFusionnerVers,
  peutGerer,
  type Tag,
  type TagId,
  TagIntrouvable,
} from '../../../../domain'

export type EchecDeFusion =
  | TagIntrouvable
  | ActionNonAutorisee
  | DestinationNonAutorisee

const tagActif = async (tagId: TagId): Promise<Tag | null> => {
  const ligne = await prismaClient.tag.findFirst({
    where: { id: tagId, suppression: null },
  })
  return ligne === null ? null : tagToDomain(ligne)
}

export const fusionnerUnTag = async ({
  acteur,
  sourceId,
  destinationId,
}: {
  readonly acteur: Acteur
  readonly sourceId: TagId
  readonly destinationId: TagId
}): Promise<Result<Tag, EchecDeFusion>> => {
  const [source, destination] = await Promise.all([
    tagActif(sourceId),
    tagActif(destinationId),
  ])

  if (source === null || destination === null) return failure(TagIntrouvable())
  if (!peutGerer(acteur)(source.portee)) return failure(ActionNonAutorisee())
  if (!peutFusionnerVers(acteur)(source, destination))
    return failure(DestinationNonAutorisee())

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

  return success(source)
}
