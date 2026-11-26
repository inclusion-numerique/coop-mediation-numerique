import type { Acteur, LireUnTagActif, Tag } from '../../../domain'
import type { DestinationDeFusion } from './destination-de-fusion'

export type LireLesCandidatesALaFusion = (criteres: {
  readonly acteur: Acteur
  readonly source: Tag
  readonly recherche: string
  readonly limite: number
}) => Promise<readonly DestinationDeFusion[]>

export type RechercherDesDestinationsPorts = {
  readonly lireUnTagActif: LireUnTagActif
  readonly lireLesCandidates: LireLesCandidatesALaFusion
}
