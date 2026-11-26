import type { LireUnTagActif, TagId } from '../../../domain'

export type EffacerUnTag = (tagId: TagId) => Promise<void>

export type SupprimerUnTagPorts = {
  readonly lireUnTagActif: LireUnTagActif
  readonly effacer: EffacerUnTag
}
