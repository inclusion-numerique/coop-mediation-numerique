import { createWriteStream } from 'node:fs'
import { output } from '@app/cli/output'
import { varFile } from '@app/config/varDirectory'
import {
  closeMongoClient,
  conseillerNumeriqueMongoCollection,
  getMongoClient,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { Command } from '@commander-js/extra-typings'

const destination = varFile('v1-cras.csv')

export const migrateCrasV1 = new Command()
  .command('v1:migrate-cras')
  .action(async () => {
    try {
      const mongoClient = await getMongoClient()

      // list collections
      const collections = await mongoClient.db().listCollections().toArray()
      output(`Collections: ${collections.map((c) => c.name).join(', ')}`)

      const crasCollection = await conseillerNumeriqueMongoCollection('cras')

      // count items
      const count = await crasCollection.countDocuments()

      output(`Found ${count} cras`)

      output(`Output file: ${destination}`)
    } finally {
      await closeMongoClient()
    }
  })
