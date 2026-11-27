import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  type DescriptionDuTag,
  type NomDuTag,
  peutGerer,
  type Tag,
  type TagId,
  TagIntrouvable,
} from '../../../domain'
import type { EchecDeModifierUnTag } from './errors'
import type { ModifierUnTagPorts } from './ports'

export const modifierUnTag =
  ({ lireUnTagActif, enregistrer }: ModifierUnTagPorts) =>
  async ({
    tagId,
    acteur,
    nom,
    description,
  }: {
    readonly tagId: TagId
    readonly acteur: Acteur
    readonly nom: NomDuTag
    readonly description: DescriptionDuTag | null
  }): Promise<Result<Tag, EchecDeModifierUnTag>> => {
    const tag = await lireUnTagActif(tagId)

    if (tag === null) return failure(TagIntrouvable())
    if (!peutGerer(acteur)(tag.portee)) return failure(ActionNonAutorisee())

    await enregistrer({ tagId, nom, description })

    return success({ ...tag, nom, description })
  }
