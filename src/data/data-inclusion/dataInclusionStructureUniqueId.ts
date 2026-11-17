import type { DataInclusionStructure } from '@/data/data-inclusion/dataInclusionStructures'

export const dataInclusionStructureUniqueId = (
  structure: Pick<DataInclusionStructure, 'id' | 'source'>,
) => `${structure.source}/${structure.id}`
