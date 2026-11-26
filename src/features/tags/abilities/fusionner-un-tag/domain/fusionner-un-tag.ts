import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActionNonAutorisee,
  DestinationNonAutorisee,
  peutFusionnerVers,
  peutGerer,
  type TagId,
  TagIntrouvable,
} from '../../../domain'
import type { EchecDeFusionnerUnTag } from './errors'
import type { FusionDeTags } from './fusion-de-tags'
import type { FusionnerUnTagPorts } from './ports'

export const fusionnerUnTag =
  ({ lireLesTags, reporter }: FusionnerUnTagPorts) =>
  async ({
    acteur,
    sourceId,
    destinationId,
  }: {
    readonly acteur: Acteur
    readonly sourceId: TagId
    readonly destinationId: TagId
  }): Promise<Result<FusionDeTags, EchecDeFusionnerUnTag>> => {
    const { source, destination } = await lireLesTags({
      sourceId,
      destinationId,
    })

    if (source === null || destination === null)
      return failure(TagIntrouvable())
    if (!peutGerer(acteur)(source.portee)) return failure(ActionNonAutorisee())
    if (!peutFusionnerVers(acteur)(source, destination))
      return failure(DestinationNonAutorisee())

    await reporter({ sourceId: source.id, destinationId: destination.id })

    return success({ source, destination })
  }
