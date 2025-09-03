import { appendFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { output } from '@app/cli/output'
import { importConseillerNumeriqueDataFromV1 } from '@app/web/app/inscription/(steps)/identification/importConseillerNumeriqueDataFromV1'
import { updateUserInscriptionProfileFromV1Data } from '@app/web/app/inscription/(steps)/identification/updateUserInscriptionProfileFromV1Data'
import { ConseillerNumeriqueV1Data } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Data'
import { ConseillerNumeriqueV1Document } from '@app/web/external-apis/conseiller-numerique/ConseillerNumeriqueV1Document'
import { fetchConseillerNumeriqueV1Data } from '@app/web/external-apis/conseiller-numerique/fetchConseillerNumeriqueV1Data'
import { prismaClient } from '@app/web/prismaClient'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { chunk } from 'lodash-es'
import { v4 } from 'uuid'
import { createMissingConseillerV1 } from './missingConseillerV1'

export const writeV1ConseillersIdsMap = async (
  map: Map<string, { userId: string; mediateurId: string }>,
) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const mapFilePath = path.join(__dirname, 'v1ConseillersIdsMap.ts')

  // write file header and empty the file
  await writeFile(
    mapFilePath,
    `// biome-ignore-all lint: generated migration map\n// A list of v1 conseiller id to v2 user & mediateur ids\nexport const v1ConseillersIdsMap = new Map([\n`,
  )

  for (const [key, value] of map) {
    await appendFile(
      mapFilePath,
      `  ['${key}', { userId: '${value.userId}', mediateurId: '${value.mediateurId}' }],\n`,
    )
  }

  await appendFile(mapFilePath, `])\n`)

  output(`${map.size} V1 conseillers IDs map written to ${mapFilePath}`)
}

const ensureMediateurForUser = async (
  userId: string,
  options?: { creation?: Date; modification?: Date },
) => {
  const existing = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (existing) return existing

  const mediateur = await prismaClient.mediateur.create({
    data: {
      id: v4(),
      userId,
      creation: options?.creation ?? new Date(),
      modification: options?.modification ?? new Date(),
    },
    select: { id: true },
  })
  return mediateur
}

const findExistingConseiller = async ({
  conseiller: { id },
  email,
  conseillersIdsMap,
}: {
  conseiller: ConseillerNumeriqueV1Data['conseiller']
  email: string
  conseillersIdsMap: Map<string, { userId: string; mediateurId: string }>
}) => {
  const existingFromId = await prismaClient.user.findFirst({
    where: {
      OR: [
        {
          mediateur: { conseillerNumerique: { id } },
        },
        {
          coordinateur: { conseillerNumeriqueId: id },
        },
      ],
    },
  })

  if (existingFromId) {
    const mediateur = await ensureMediateurForUser(existingFromId.id)
    conseillersIdsMap.set(id, {
      userId: existingFromId.id,
      mediateurId: mediateur.id,
    })
    return existingFromId
  }

  const existingFromEmail = await prismaClient.user.findFirst({
    where: {
      email,
    },
  })

  if (existingFromEmail) {
    const mediateur = await ensureMediateurForUser(existingFromEmail.id)
    conseillersIdsMap.set(id, {
      userId: existingFromEmail.id,
      mediateurId: mediateur.id,
    })
    return existingFromEmail
  }

  return null
}

export type SingleConseillerResult = {
  conseillerMissingInV1Mongo?: { id: string; cras: number }
  existingConseiller?: { id: string; emailPro: string; email: string }
  createdConseiller?: { id: string; emailPro: string; email: string }
}

export type MigrateConseillerV1Result = {
  conseillerMissingInV1Mongo: { id: string; cras: number }[]
  existingConseiller: { id: string; emailPro: string; email: string }[]
  createdConseiller: { id: string; emailPro: string; email: string }[]
}

const migrateConseillerV1 = async ({
  v1ConseillerId,
  cras,
  conseillersIdsMap,
}: {
  v1ConseillerId: string
  cras: number
  conseillersIdsMap: Map<string, { userId: string; mediateurId: string }>
}): Promise<SingleConseillerResult> => {
  await createMissingConseillerV1()

  const conseillerV1Data = await fetchConseillerNumeriqueV1Data({
    v1ConseillerId,
  })
  if (!conseillerV1Data) {
    return {
      conseillerMissingInV1Mongo: {
        id: v1ConseillerId,
        cras,
      },
    }
  }

  const { conseiller } = conseillerV1Data

  // we search in our database if the conseiller already exists
  const email = conseiller.emailPro
    ? conseiller.emailPro.trim().toLowerCase()
    : `conseiller-v1-${v1ConseillerId}@coop-numerique.anct.gouv.fr`
  let user = await findExistingConseiller({
    conseiller,
    email,
    conseillersIdsMap,
  })

  const result: SingleConseillerResult = {}

  if (user) {
    result.existingConseiller = {
      id: v1ConseillerId,
      emailPro: user.email,
      email: user.email,
    }
  }

  // Create the conseiller in our database if it does not exist
  if (!user) {
    const id = v4()

    user = await prismaClient.user
      .create({
        data: {
          id,
          email,
          firstName: conseiller.prenom,
          lastName: conseiller.nom,
          name: `${conseiller.prenom} ${conseiller.nom}`.trim(),
          created: conseiller.createdAt,
          updated: conseiller.updatedAt ?? undefined,
          deleted: new Date(),
          v1Imported: new Date(),
        },
      })
      .catch((error) => {
        console.error('Could not create conseiller in database', {
          id,
          emailPro: conseiller.emailPro,
          email: conseiller.email,
          migrationEmail: email,
          prenom: conseiller.prenom,
          nom: conseiller.nom,
          createdAt: conseiller.createdAt,
          updatedAt: conseiller.updatedAt,
          v1id: id,
        })
        throw error
      })
  }

  const mediateur = await ensureMediateurForUser(user.id, {
    creation: user.created ?? new Date(),
    modification: user.updated ?? new Date(),
  })

  const profilCheckedUser = await updateUserInscriptionProfileFromV1Data({
    user,
    v1Conseiller: conseillerV1Data,
  })

  await importConseillerNumeriqueDataFromV1({
    user: profilCheckedUser,
    v1Conseiller: conseillerV1Data,
    allowMissingMiseEnRelation: true,
  })

  conseillersIdsMap.set(v1ConseillerId, {
    userId: user.id,
    mediateurId: mediateur.id,
  })

  return result
}

const batchSize = 10
export const migrateConseillersV1 = async ({
  v1ConseillersIds,
  conseillersIdsMap,
}: {
  v1ConseillersIds: Map<string, number> // map from v1id to number of cras
  conseillersIdsMap: Map<string, { userId: string; mediateurId: string }>
}) => {
  const chunks = chunk([...v1ConseillersIds.entries()], batchSize)

  const result: {
    conseillerMissingInV1Mongo: { id: string; cras: number }[]
  } = {
    conseillerMissingInV1Mongo: [],
  }

  for (const chunkIndex in chunks) {
    const chunk = chunks[chunkIndex]
    const chunkResults = await Promise.all(
      chunk.map(([v1ConseillerId, cras]) =>
        migrateConseillerV1({ v1ConseillerId, cras, conseillersIdsMap }),
      ),
    )

    for (const itemResult of chunkResults) {
      if (itemResult.conseillerMissingInV1Mongo) {
        result.conseillerMissingInV1Mongo.push(
          itemResult.conseillerMissingInV1Mongo,
        )
      }
    }

    const done = Number(chunkIndex) * batchSize + chunk.length
    output(
      `Migrated ${numberToString(done)}/${numberToString(v1ConseillersIds.size)} (${numberToPercentage((100 * done) / v1ConseillersIds.size)}) conseillers`,
    )
  }

  return result
}
