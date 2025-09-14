import { output } from '@app/cli/output'
import {
  closeMongoClient,
  conseillerNumeriqueMongoCollection,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { RemapDuplicatedStructuresV1Job } from './RemapDuplicatedStructuresV1Job'
import { v1StructuresIdsMap } from '../migrate-structures-v1/v1StructuresIdsMap'
import { v1PermanencesIdsMap } from '../migrate-structures-v1/v1PermanencesIdsMap'
import {
  migrateStructuresV1,
  V2StructureMapValue,
  writeV1StructuresIdsMap,
} from './remapDuplicatedStructuresV1'
import { StructureV1Document } from '../migrate-structures-v1/StructureV1Document'

export const executeRemapDuplicatedStructuresV1 = async (
  _job: RemapDuplicatedStructuresV1Job,
) => {
  // write allPossibleThemes and allPossibleSousThemes to debugOutput, format pretty

  // Fetch all structures and put them in a map by stringifyed id: Map<string, StructureV1>
  const structures = (await structuresCollection
    .find()
    .sort({ updatedAt: 1 })
    .toArray()) as StructureV1Document[]
  const structuresMap = new Map(
    structures.map((structure) => [structure._id.toString(), structure]),
  )
  output(`Found ${structuresMap.size} structures`)

  // Create a map of v1 structure id to v2 structure info for deduplication and later cra mappings
  const v1StructuresIdsMap = new Map<string, V2StructureMapValue>()

  await migrateStructuresV1({ structures, v1StructuresIdsMap })

  await writeV1StructuresIdsMap(v1StructuresIdsMap)

  const permanences = await permanencesCollection
    .find()
    .sort({ updatedAt: 1 })
    .toArray()

  const permanencesMap = new Map(
    permanences.map((permanence) => [permanence._id.toString(), permanence]),
  )
  output(`Found ${permanencesMap.size} permanences`)
}
