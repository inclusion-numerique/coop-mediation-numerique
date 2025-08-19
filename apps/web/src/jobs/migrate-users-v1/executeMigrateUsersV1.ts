import { output } from '@app/cli/output'
import { varFile } from '@app/config/varDirectory'
import { closeMongoClient } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { PermanenceV1Document } from '../migrate-structures-v1/PermanenceV1Document'
import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { migrateConseillersV1 } from './migrateConseillersV1'
import { prismaClient } from '@app/web/prismaClient'
import { writeV1ConseillersIdsMap } from './migrateConseillersV1'
import { appendFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFile } from 'node:fs/promises'
import { v1ConseillersIds } from './v1ConseillersIds'
import { MigrateUsersV1Job } from './MigrateUsersV1Job'

/**
 * Pour importer les cras v1, on a besoin d'importer les conseillers v1
 * pour lier leurs cras.
 *
 * Il y a 2 576 373 cras v1.
 *
 * Il y a 4 661 conseillers v1 avec au moins 1 CRA.
 *
 * Cas problématiques :
 *  1. Le cra v1 a un id de conseiller numérique qui n'existe pas dans la base de données v1
 *     TODO
 *  2. le conseiller v1 n'a pas d'email pro
 *     - on créé un conseiller v2 avec un email générique conseiller-v1-{id_v1}@coop-numerique.anct.gouv.fr
 *  3. le conseiller v1 a un id mongo unique mais un idPG v1 en doublon avec un autre conseiller v1
 *     - on n'assigne pas le conseiller id à ce conseiller mais on le laisse en médiateur pour ne pas changer un idPg existant (en v2) sur un autre utilisateur
 *
 */

export const writeV1ConseillersIds = async (
  rows: { id: string; cras: number }[],
) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const mapFilePath = path.join(__dirname, 'v1ConseillersIds.ts')

  // write file header and empty the file
  await writeFile(
    mapFilePath,
    `// A list of v1 conseiller id to v2 conseiller uuid\nexport const v1ConseillersIds = new Map([\n`,
  )

  output(`Writing ${rows.length} v1 conseillers ids`)
  for (const row of rows) {
    await appendFile(mapFilePath, `  ['${row.id}', ${row.cras}],\n`)
  }

  await appendFile(mapFilePath, `])\n`)

  output(`${rows.length} V1 conseillers IDs written to ${mapFilePath}`)
}

export const writeResult = async (result: unknown) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const mapFilePath = path.join(__dirname, 'result.json')

  await writeFile(mapFilePath, JSON.stringify(result, null, 2))

  output(`Result written to ${mapFilePath}`)
}

const mapV1ConseillersIds = async () => {
  const v1ConseillersIds: { id: string; cras: number }[] =
    await prismaClient.$queryRaw`SELECT v1_conseiller_numerique_id as "id", COUNT(*)::INT as cras FROM cras_conseiller_numerique_v1 GROUP BY v1_conseiller_numerique_id`

  await writeV1ConseillersIds(v1ConseillersIds)
}

const shouldWriteV1ConseillersIds = false

export const executeMigrateUsersV1 = async (_job: MigrateUsersV1Job) => {
  if (shouldWriteV1ConseillersIds) {
    await mapV1ConseillersIds()
  }
  try {
    output(`Found ${v1ConseillersIds.size} conseillers`)

    const conseillersIdsMap = new Map<string, string>()

    const result = await migrateConseillersV1({
      v1ConseillersIds,
      conseillersIdsMap,
    })

    const totalConseillersMissingInV1Mongo =
      result.conseillerMissingInV1Mongo.length
    const totalCrasFromConseillersMissingInV1Mongo =
      result.conseillerMissingInV1Mongo.reduce(
        (acc, item) => acc + item.cras,
        0,
      )

    const finalResult = {
      ...result,
      totalConseillersMissingInV1Mongo,
      totalCrasFromConseillersMissingInV1Mongo,
    }

    output(
      `${totalConseillersMissingInV1Mongo} conseillers missing in v1 mongo`,
    )
    output(`Migration result: \n${JSON.stringify(finalResult, null, 2)}`)
    await writeResult(result)

    await writeV1ConseillersIdsMap(conseillersIdsMap)
  } finally {
    await closeMongoClient()
  }
}
