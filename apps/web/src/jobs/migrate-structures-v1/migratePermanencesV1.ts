import { appendFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { chunk } from 'lodash-es'
import { v4 } from 'uuid'
import { PermanenceV1Document } from './PermanenceV1Document'

const findExistingPermanence = async ({
  permanence,
}: {
  permanence: PermanenceV1Document
}) => {
  // Use adresse.codeCommune as city code
  const codeCommune = permanence.adresse.codeCommune
  if (!codeCommune) {
    return null
  }

  const existingFromId = await prismaClient.structure.findFirst({
    where: {
      v1PermanenceId: permanence._id.toString(),
    },
  })

  if (existingFromId) {
    return existingFromId
  }

  const existingFromSiret = permanence.siret
    ? await prismaClient.structure.findFirst({
        where: {
          siret: permanence.siret,
          nom: { equals: permanence.nomEnseigne, mode: 'insensitive' },
          codeInsee: codeCommune,
        },
      })
    : null

  if (existingFromSiret) {
    return existingFromSiret
  }

  // If the permanence has no address, it is not possible to be sure that it already exists
  const adresseString = permanence.adresse.numeroRue
    ? `${permanence.adresse.numeroRue} ${permanence.adresse.rue}`
    : permanence.adresse.rue

  if (!adresseString) {
    return null
  }

  const existingFromAdresse = await prismaClient.structure.findFirst({
    where: {
      nom: { equals: permanence.nomEnseigne, mode: 'insensitive' },
      adresse: {
        equals: adresseString,
        mode: 'insensitive',
      },
      codeInsee: codeCommune,
    },
  })

  return existingFromAdresse
}

const findCartographieNationaleStructure = async ({
  permanence,
}: {
  permanence: PermanenceV1Document
}) => {
  if (!permanence.siret) {
    return null
  }

  return prismaClient.structureCartographieNationale.findFirst({
    where: {
      pivot: permanence.siret,
      nom: { equals: permanence.nomEnseigne, mode: 'insensitive' },
    },
  })
}

export type V2PermanenceMapValue = {
  id: string
  codePostal?: string | null
  commune?: string | null
  codeInsee?: string | null
}

export const writeV1PermanencesIdsMap = async (
  map: Map<string, V2PermanenceMapValue>,
) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const mapFilePath = path.join(__dirname, 'v1PermanencesIdsMap.ts')

  await writeFile(
    mapFilePath,
    `// biome-ignore-all lint: generated migration map\n// A list of v1 permanence id to v2 structure info\nexport const v1PermanencesIdsMap = new Map([\n`,
  )

  for (const [key, value] of map) {
    await appendFile(
      mapFilePath,
      `  ['${key}', { id: '${value.id}', codePostal: ${JSON.stringify(
        value.codePostal ?? null,
      )}, commune: ${JSON.stringify(value.commune ?? null)}, codeInsee: ${JSON.stringify(
        value.codeInsee ?? null,
      )} }],\n`,
    )
  }

  await appendFile(mapFilePath, `])\n`)

  output(`${map.size} V1 permanences IDs map written to ${mapFilePath}`)
}

const migratePermanenceV1 = async ({
  permanence,
  v1PermanencesIdsMap,
}: {
  permanence: PermanenceV1Document
  v1PermanencesIdsMap: Map<string, V2PermanenceMapValue>
}) => {
  // we search in our database if the permanence already exists
  const existingStructure = await findExistingPermanence({
    permanence,
  })

  // If structure exists in our database, we update it
  if (existingStructure) {
    await prismaClient.structure.update({
      where: {
        id: existingStructure.id,
      },
      data: {
        v1PermanenceId: permanence._id.toString(),
      },
    })

    v1PermanencesIdsMap.set(permanence._id.toString(), {
      id: existingStructure.id,
      codePostal: existingStructure.codePostal,
      commune: existingStructure.commune,
      codeInsee: existingStructure.codeInsee,
    })

    return
  }

  // we search in cartographie-nationale if the structure already exists
  const existingStructureFromCartographieNationale =
    await findCartographieNationaleStructure({ permanence })

  // Build address string
  const adresseString = permanence.adresse.numeroRue
    ? `${permanence.adresse.numeroRue} ${permanence.adresse.rue}`
    : permanence.adresse.rue

  // Create the structure in our database
  const id = v4()
  await prismaClient.structure.create({
    data: {
      id,
      nom: permanence.nomEnseigne,
      structureCartographieNationaleId:
        existingStructureFromCartographieNationale?.id,
      commune: permanence.adresse.ville,
      codePostal: permanence.adresse.codePostal,
      adresse: adresseString || '',
      latitude:
        typeof permanence.location.coordinates[1] === 'number'
          ? permanence.location.coordinates[1]
          : Number(permanence.location.coordinates[1]),
      longitude:
        typeof permanence.location.coordinates[0] === 'number'
          ? permanence.location.coordinates[0]
          : Number(permanence.location.coordinates[0]),
      codeInsee: permanence.adresse.codeCommune,
      siret: permanence.siret,
      v1PermanenceId: permanence._id.toString(),
      v1Imported: new Date(),
    },
  })

  v1PermanencesIdsMap.set(permanence._id.toString(), {
    id,
    codePostal: permanence.adresse.codePostal,
    commune: permanence.adresse.ville,
    codeInsee: permanence.adresse.codeCommune,
  })
}

const batchSize = 10
export const migratePermanencesV1 = async ({
  permanences,
  v1PermanencesIdsMap,
}: {
  permanences: PermanenceV1Document[]
  v1PermanencesIdsMap: Map<string, V2PermanenceMapValue> // used to map v1 permanence id to v2 structure info for deduplication and later cra mappings
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
