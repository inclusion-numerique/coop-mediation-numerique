import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  peutGerer,
  type Tag,
  type TagId,
  TagIntrouvable,
} from '../../../domain'
import type { EchecDeSupprimerUnTag } from './errors'
import type { SupprimerUnTagPorts } from './ports'

export const supprimerUnTag =
  ({ lireUnTagActif, effacer }: SupprimerUnTagPorts) =>
  async ({
    tagId,
    acteur,
  }: {
    readonly tagId: TagId
    readonly acteur: Acteur
  }): Promise<Result<Tag, EchecDeSupprimerUnTag>> => {
    const tag = await lireUnTagActif(tagId)

    if (tag === null) return failure(TagIntrouvable())
    if (!peutGerer(acteur)(tag.portee)) return failure(ActionNonAutorisee())

    await effacer(tag.id)

    return success(tag)
  }
