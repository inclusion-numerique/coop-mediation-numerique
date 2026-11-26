import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  DestinationNonAutorisee,
  peutFusionnerVers,
  peutGerer,
  type Tag,
  type TagId,
  TagIntrouvable,
} from '../../../domain'

export type EchecDeFusion =
  | TagIntrouvable
  | ActionNonAutorisee
  | DestinationNonAutorisee

type TagsDeLaFusion = {
  readonly sourceId: TagId
  readonly destinationId: TagId
}

export type LireLesTagsDeLaFusion = (tags: TagsDeLaFusion) => Promise<{
  readonly source: Tag | null
  readonly destination: Tag | null
}>

export type ReporterLeTag = (fusion: TagsDeLaFusion) => Promise<void>

export const fusionnerUnTag =
  ({
    lireLesTags,
    reporter,
  }: {
    readonly lireLesTags: LireLesTagsDeLaFusion
    readonly reporter: ReporterLeTag
  }) =>
  async ({
    acteur,
    sourceId,
    destinationId,
  }: {
    readonly acteur: Acteur
    readonly sourceId: TagId
    readonly destinationId: TagId
  }): Promise<Result<Tag, EchecDeFusion>> => {
    const { source, destination } = await lireLesTags({
      sourceId,
      destinationId,
    })

    if (source === null || destination === null)
      return failure(TagIntrouvable())
    if (!peutGerer(acteur)(source.portee)) return failure(ActionNonAutorisee())
    if (!peutFusionnerVers(acteur)(source, destination))
      return failure(DestinationNonAutorisee())

    await reporter({ sourceId, destinationId })

    return success(source)
  }
