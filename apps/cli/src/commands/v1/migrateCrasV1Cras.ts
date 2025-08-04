import { output } from '@app/cli/output'
import { varFile } from '@app/config/varDirectory'
import {
  closeMongoClient,
  conseillerNumeriqueMongoCollection,
  getMongoClient,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { Command } from '@commander-js/extra-typings'
import { StructureV1Document } from './crasV1/StructureV1Document'
import {
  migrateStructuresV1,
  writeV1StructuresIdsMap,
} from './crasV1/migrateStructuresV1'
import {
  migratePermanencesV1,
  writeV1PermanencesIdsMap,
} from './crasV1/migratePermanencesV1'
import { PermanenceV1Document } from './crasV1/PermanenceV1Document'
import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { migrateConseillersV1 } from './crasV1/migrateConseillersV1'

export const migrateCrasV1Cras = new Command()
  .command('v1:migrate-cras:cras')
  .action(async () => {
    try {
      const crasCollection = await conseillerNumeriqueMongoCollection('cras')

      // TODO
    } finally {
      await closeMongoClient()
    }
  })
