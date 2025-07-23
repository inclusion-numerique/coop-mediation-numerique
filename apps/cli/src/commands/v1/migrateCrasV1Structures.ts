import { output } from '@app/cli/output'
import { varFile } from '@app/config/varDirectory'
import {
  closeMongoClient,
  conseillerNumeriqueMongoCollection,
  getMongoClient,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { Command } from '@commander-js/extra-typings'
import { StructureV1Document } from './crasV1/StructureV1Document'
import { migrateStructuresV1 } from './crasV1/migrateStructuresV1'
import { migratePermanencesV1 } from './crasV1/migratePermanencesV1'
import { PermanenceV1Document } from './crasV1/PermanenceV1Document'

const destination = varFile('v1-cras.csv')

const debugOutput = varFile('v1-cras.import.debug.json')

export const migrateCrasV1Structures = new Command()
  .command('v1:migrate-cras:structures')
  .action(async () => {
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

      await migrateStructuresV1({ structures })

      const permanences = (await permanencesCollection
        .find()
        .sort({ updatedAt: 1 })
        .toArray()) as PermanenceV1Document[]

      const permanencesMap = new Map(
        permanences.map((permanence) => [
          permanence._id.toString(),
          permanence,
        ]),
      )
      output(`Found ${permanencesMap.size} permanences`)

      await migratePermanencesV1({ permanences })
    } finally {
      await closeMongoClient()
    }
  })
