import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { tagToDomain } from '../../../../db/tag.transfer'
import {
  type Acteur,
  ActionNonAutorisee,
  type DescriptionDuTag,
  type NomDuTag,
  peutGerer,
  type Tag,
  type TagId,
  TagIntrouvable,
} from '../../../../domain'

export type EchecDeModification = TagIntrouvable | ActionNonAutorisee

export const modifierUnTag = async ({
  tagId,
  acteur,
  nom,
  description,
  maintenant = new Date(),
}: {
  readonly tagId: TagId
  readonly acteur: Acteur
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly maintenant?: Date
}): Promise<Result<Tag, EchecDeModification>> => {
  const ligne = await prismaClient.tag.findFirst({
    where: { id: tagId, suppression: null },
  })
  const tag = ligne === null ? null : tagToDomain(ligne)

  if (tag === null) return failure(TagIntrouvable())
  if (!peutGerer(acteur)(tag.portee)) return failure(ActionNonAutorisee())

  await prismaClient.tag.update({
    where: { id: tagId },
    data: { nom, description, modification: maintenant },
  })

  return success({ ...tag, nom, description })
}
