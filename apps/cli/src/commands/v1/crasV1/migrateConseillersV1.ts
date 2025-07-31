import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { v4 } from 'uuid'
import { chunk } from 'lodash-es'
import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { appendFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Conseiller } from '@app/web/external-apis/conseiller-numerique/Conseiller'

const findExistingConseiller = async ({
  conseiller,
}: { conseiller: ConseillerNumeriqueV1Document }) => {
  const existingFromId = await prismaClient.user.findFirst({
    where: {
      OR: [
        {
          mediateur: { conseillerNumerique: { id: conseiller._id.toString() } },
        },
        {
          coordinateur: { conseillerNumeriqueId: conseiller._id.toString() },
        },
      ],
    },
  })

  if (existingFromId) {
    return existingFromId
  }

  const existingFromEmail = await prismaClient.user.findFirst({
    where: {
      email: { equals: conseiller.emailPro, mode: 'insensitive' },
    },
  })

  if (existingFromEmail) {
    return existingFromEmail
  }

  return null
}

const migrateConseillerV1 = async ({
  conseiller,
}: {
  conseiller: ConseillerNumeriqueV1Document
}) => {
  // we search in our database if the conseiller already exists
  const existingConseiller = await findExistingConseiller({
    conseiller,
  })

  if (existingConseiller) {
    // nothing to do, we do not update any data from this migration
    // TODO check coordination
    return
  }

  // Create the conseiller in our database
  const id = v4()
  const user = await prismaClient.user.create({
    data: {
      id,
      email: conseiller.emailPro || conseiller.email,
      firstName: conseiller.prenom,
      lastName: conseiller.nom,
      name: `${conseiller.prenom} ${conseiller.nom}`.trim(),
      created: conseiller.createdAt,
      updated: conseiller.updatedAt ?? undefined,
      deleted: new Date(),
      v1Imported: new Date(),
    },
  })

  await importConseillerNumeriqueDataFromV1({
    user,
    v1Conseiller: conseiller,
  })

  v1PermanencesIdsMap.set(permanence._id.toString(), id)
}

const batchSize = 10
export const migratePermanencesV1 = async ({
  permanences,
  v1PermanencesIdsMap,
}: {
  permanences: PermanenceV1Document[]
  v1PermanencesIdsMap: Map<string, string> // used to map v1 permanence id to v2 structure id for deduplication and later cra mappings
}) => {
  const chunks = chunk(permanences, batchSize)

  for (const chunkIndex in chunks) {
    const chunk = chunks[chunkIndex]
    await Promise.all(
      chunk.map((permanence) =>
        migratePermanenceV1({ permanence, v1PermanencesIdsMap }),
      ),
    )

    const done = Number(chunkIndex) * batchSize + chunk.length
    output(
      `Migrated ${numberToString(done)}/${numberToString(permanences.length)} (${numberToPercentage((100 * done) / permanences.length)}) permanences`,
    )
  }
}
