import { output } from '@app/cli/output'
import {
  closeMongoClient,
  conseillerNumeriqueMongoCollection,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { StructureV1Document } from './StructureV1Document'
import {
  migrateStructuresV1,
  writeV1StructuresIdsMap,
} from './migrateStructuresV1'
import {
  migratePermanencesV1,
  writeV1PermanencesIdsMap,
} from './migratePermanencesV1'
import { MigrateStructuresV1Job } from './MigrateStructuresV1Job'

export const executeMigrateStructuresV1 = async (
  _job: MigrateStructuresV1Job,
) => {
  try {
    const structuresCollection =
      await conseillerNumeriqueMongoCollection('structures')
    const permanencesCollection =
      await conseillerNumeriqueMongoCollection('permanences')

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

    // Create a map of v1 structure id to v2 structure id for deduplication and later cra mappings
    const v1StructuresIdsMap = new Map<string, string>()

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

    // Create a map of v1 permanence id to v2 structure id for deduplication and later cra mappings
    const v1PermanencesIdsMap = new Map<string, string>()

    await migratePermanencesV1({ permanences, v1PermanencesIdsMap })

    await writeV1PermanencesIdsMap(v1PermanencesIdsMap)
  } finally {
    await closeMongoClient()
  }
}
