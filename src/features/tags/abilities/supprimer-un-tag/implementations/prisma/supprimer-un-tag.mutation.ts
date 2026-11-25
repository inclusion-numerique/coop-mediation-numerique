import { prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  type NomDuTag,
  peutGerer,
  type TagId,
  TagIntrouvable,
} from '../../../../domain'
import { tagToDomain } from '../../../../implementations/prisma/tag.transfer'

export type EchecDeSuppression = TagIntrouvable | ActionNonAutorisee

export const supprimerUnTag = async ({
  tagId,
  acteur,
}: {
  readonly tagId: TagId
  readonly acteur: Acteur
}): Promise<Result<{ readonly nom: NomDuTag }, EchecDeSuppression>> => {
  const ligne = await prismaClient.tag.findFirst({
    where: { id: tagId, suppression: null },
  })
  const tag = ligne === null ? null : tagToDomain(ligne)

  if (tag === null) return failure(TagIntrouvable())
  if (!peutGerer(acteur)(tag.portee)) return failure(ActionNonAutorisee())

  await prismaClient.$transaction([
    prismaClient.activitesTags.deleteMany({ where: { tagId } }),
    prismaClient.activitesCoordinationTags.deleteMany({ where: { tagId } }),
    prismaClient.tag.delete({ where: { id: tagId } }),
  ])

  return success({ nom: tag.nom })
}
