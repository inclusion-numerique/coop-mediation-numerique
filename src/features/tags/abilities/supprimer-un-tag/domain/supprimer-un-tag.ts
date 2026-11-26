import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  type LireUnTagActif,
  type NomDuTag,
  peutGerer,
  type TagId,
  TagIntrouvable,
} from '../../../domain'

export type EchecDeSuppression = TagIntrouvable | ActionNonAutorisee

export type EffacerUnTag = (tagId: TagId) => Promise<void>

export const supprimerUnTag =
  ({
    lireUnTagActif,
    effacer,
  }: {
    readonly lireUnTagActif: LireUnTagActif
    readonly effacer: EffacerUnTag
  }) =>
  async ({
    tagId,
    acteur,
  }: {
    readonly tagId: TagId
    readonly acteur: Acteur
  }): Promise<Result<{ readonly nom: NomDuTag }, EchecDeSuppression>> => {
    const tag = await lireUnTagActif(tagId)

    if (tag === null) return failure(TagIntrouvable())
    if (!peutGerer(acteur)(tag.portee)) return failure(ActionNonAutorisee())

    await effacer(tagId)

    return success({ nom: tag.nom })
  }
