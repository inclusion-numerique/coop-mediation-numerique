import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { porteeFromDomain } from '../../../../db/tag.transfer'
import {
  type Acteur,
  type DescriptionDuTag,
  type NomDuTag,
  porteeChoisie,
  type Tag,
  TagId,
  type VisibiliteChoisie,
  VisibiliteNonAutorisee,
} from '../../../../domain'

export const creerUnTag = async ({
  acteur,
  nom,
  description,
  visibilite,
}: {
  readonly acteur: Acteur
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly visibilite: VisibiliteChoisie
}): Promise<Result<Tag, VisibiliteNonAutorisee>> => {
  const portee = porteeChoisie(acteur, visibilite)

  if (portee === null) return failure(VisibiliteNonAutorisee())

  const { id } = await prismaClient.tag.create({
    data: { nom, description, ...porteeFromDomain(portee) },
    select: { id: true },
  })

  return success({ id: TagId(id), nom, description, portee })
}
