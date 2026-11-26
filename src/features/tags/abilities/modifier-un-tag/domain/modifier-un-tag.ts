import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  type DescriptionDuTag,
  type LireUnTagActif,
  type NomDuTag,
  peutGerer,
  type Tag,
  type TagId,
  TagIntrouvable,
} from '../../../domain'

export type EchecDeModification = TagIntrouvable | ActionNonAutorisee

export type EnregistrerLaModification = (modification: {
  readonly tagId: TagId
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
}) => Promise<void>

export const modifierUnTag =
  ({
    lireUnTagActif,
    enregistrer,
  }: {
    readonly lireUnTagActif: LireUnTagActif
    readonly enregistrer: EnregistrerLaModification
  }) =>
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
  }): Promise<Result<Tag, EchecDeModification>> => {
    const tag = await lireUnTagActif(tagId)

    if (tag === null) return failure(TagIntrouvable())
    if (!peutGerer(acteur)(tag.portee)) return failure(ActionNonAutorisee())

    await enregistrer({ tagId, nom, description })

    return success({ ...tag, nom, description })
  }
