import type { Acteur, LireUnTagActif, Tag, TagId } from '../../../domain'
import type { DestinationDeFusion } from './destination-de-fusion'

export type TagsDeLaFusion = {
  readonly sourceId: TagId
  readonly destinationId: TagId
}

export type LireLesTagsDeLaFusion = (tags: TagsDeLaFusion) => Promise<{
  readonly source: Tag | null
  readonly destination: Tag | null
}>

export type ReporterLeTag = (fusion: TagsDeLaFusion) => Promise<void>

export type FusionnerUnTagPorts = {
  readonly lireLesTags: LireLesTagsDeLaFusion
  readonly reporter: ReporterLeTag
}

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
