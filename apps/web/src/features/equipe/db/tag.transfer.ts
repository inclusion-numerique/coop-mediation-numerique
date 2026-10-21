import { NomTag, type TagExistant, TagId } from '../domain'

export const tagsDetenusToDomain = (
  rows: readonly { id: string; nom: string }[],
): readonly TagExistant[] =>
  rows.flatMap(({ id, nom }) => {
    const nomTag = NomTag.safe(nom)

    return nomTag === null ? [] : [{ id: TagId(id), nom: nomTag }]
  })
