import type { Tag, TagId } from '../../../domain'

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
