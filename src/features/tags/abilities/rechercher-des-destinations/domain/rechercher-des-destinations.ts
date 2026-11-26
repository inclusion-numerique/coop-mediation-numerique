import { type Result, success } from '@/libraries/result'
import { type Acteur, peutFusionnerVers, type TagId } from '../../../domain'
import type { DestinationDeFusion } from './destination-de-fusion'
import type { RechercherDesDestinationsPorts } from './ports'

export const rechercherDesDestinations =
  ({ lireUnTagActif, lireLesCandidates }: RechercherDesDestinationsPorts) =>
  async ({
    acteur,
    sourceId,
    recherche,
    limite,
  }: {
    readonly acteur: Acteur
    readonly sourceId: TagId
    readonly recherche: string
    readonly limite: number
  }): Promise<Result<readonly DestinationDeFusion[], never>> => {
    const source = await lireUnTagActif(sourceId)
    if (source === null) return success([])

    const candidates = await lireLesCandidates({
      acteur,
      source,
      recherche,
      limite,
    })

    return success(
      candidates.filter(({ tag }) => peutFusionnerVers(acteur)(source, tag)),
    )
  }
