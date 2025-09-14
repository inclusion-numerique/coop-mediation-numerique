import { appendFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { chunk } from 'lodash-es'
import { v4 } from 'uuid'
import { StructureV1Document } from '../migrate-structures-v1/StructureV1Document'
import { v1StructuresCodesInseeMap } from './v1DeduplicatedStructuresCodesInseeMap'

/**
 * Structures has been remaped :
 *  - for each v1 structure and permanence id map :
 *  -> find the existing v2 structure from its map id
 *  -> if not exists, find it from the carto id included in the string (should be deduplicated so all be present)
 *  -> if missing, throw clear error with structure data and we'll advise (maybe fetch from mongo and migrate it again :( ))
 *  -> maybe we should fetch all like the migratev1 structure job ?
 */

export type V2StructureMapValue = {
  id: string
  codePostal?: string | null
  commune?: string | null
  codeInsee?: string | null
}

export const writeV1DeduplicatedStructuresIdsMap = async (
  map: Map<string, V2StructureMapValue>,
) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const mapFilePath = path.join(__dirname, 'v1DeduplicatedStructuresIdsMap.ts')

  // write file header and empty the file
  await writeFile(
    mapFilePath,
    `// biome-ignore-all lint: generated migration map\n// A list of v1 structure id to v2 structure info\nexport const v1DeduplicatedStructuresIdsMap = new Map<string, {
  id: string
  codePostal?: string | null
  commune?: string | null
  codeInsee?: string | null
}>([\n`,
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

  output(`${map.size} V1 structures IDs map written to ${mapFilePath}`)
}

const findExistingStructure = async ({
  structure,
  v1StructuresIdsMap,
}: {
  structure: StructureV1Document
  v1StructuresIdsMap: Map<string, V2StructureMapValue>
}) => {
  const existingFromId = await prismaClient.structure.findFirst({
    where: {
      v1StructureId: structure._id.toString(),
    },
  })

  if (existingFromId) {
    v1StructuresIdsMap.set(structure._id.toString(), {
      id: existingFromId.id,
      codePostal: existingFromId.codePostal,
      commune: existingFromId.commune,
      codeInsee: existingFromId.codeInsee,
    })
    return existingFromId
  }

  // if structure has no citycode, return null as it is not possible to be sure that it already exists
  const codeCommune =
    structure.codeCommune ?? structure.adresseInsee2Ban?.citycode ?? null
  if (!codeCommune) {
    return null
  }

  const existingFromSiret = structure.siret
    ? await prismaClient.structure.findFirst({
        where: {
          siret: structure.siret,
          nom: { equals: structure.nom, mode: 'insensitive' },
          codeInsee: codeCommune,
        },
      })
    : null

  if (existingFromSiret) {
    v1StructuresIdsMap.set(structure._id.toString(), {
      id: existingFromSiret.id,
      codePostal: existingFromSiret.codePostal,
      commune: existingFromSiret.commune,
      codeInsee: existingFromSiret.codeInsee,
    })
    return existingFromSiret
  }

  // If the structure has no address name, it is not possible to be sure that it already exists
  if (!structure.adresseInsee2Ban?.name) {
    return null
  }

  const existingFromAdresse = await prismaClient.structure.findFirst({
    where: {
      nom: { equals: structure.nom, mode: 'insensitive' },
      adresse: {
        equals: structure.adresseInsee2Ban.name,
        mode: 'insensitive',
      },
      codeInsee: codeCommune,
    },
  })

  if (existingFromAdresse) {
    v1StructuresIdsMap.set(structure._id.toString(), {
      id: existingFromAdresse.id,
      codePostal: existingFromAdresse.codePostal,
      commune: existingFromAdresse.commune,
      codeInsee: existingFromAdresse.codeInsee,
    })
    return existingFromAdresse
  }

  return existingFromAdresse
}

const findCartographieNationaleStructure = async ({
  structure,
}: {
  structure: StructureV1Document
}) => {
  if (!structure.siret) {
    return null
  }

  return prismaClient.structureCartographieNationale.findFirst({
    where: {
      pivot: structure.siret,
      nom: { equals: structure.nom, mode: 'insensitive' },
    },
  })
}

const migrateStructureV1 = async ({
  structure,
  v1StructuresIdsMap,
}: {
  structure: StructureV1Document
  v1StructuresIdsMap: Map<string, V2StructureMapValue>
}) => {
  // we search in our database if the structure already exists
  const existingStructure = await findExistingStructure({
    structure,
    v1StructuresIdsMap,
  })

  // If structure exists in our database, we update it
  if (existingStructure) {
    await prismaClient.structure.update({
      where: {
        id: existingStructure.id,
      },
      data: {
        v1StructureId: structure._id.toString(),
        v1StructureIdPg: structure.idPG,
      },
    })

    return
  }

  // we search in cartographie-nationale if the structure already exists
  const existingStructureFromCartographieNationale =
    await findCartographieNationaleStructure({ structure })

  // Create the structure in our database
  const v1StructureId = structure._id.toString()

  const codeInsee =
    structure.codeCommune?.trim() ||
    structure.adresseInsee2Ban?.citycode?.trim() ||
    v1StructuresCodesInseeMap.get(v1StructureId)
  if (!codeInsee) {
    throw new Error(`Code insee not found for v1 structure ${v1StructureId}`)
  }
  const id = v4()
  const created = await prismaClient.structure.create({
    data: {
      id,
      nom: structure.nom,
      structureCartographieNationaleId:
        existingStructureFromCartographieNationale?.id,
      commune: structure.adresseInsee2Ban?.city || '',
      codePostal: structure.adresseInsee2Ban?.postcode || '',
      adresse: structure.adresseInsee2Ban?.name || '',
      latitude: structure.location.coordinates[1],
      longitude: structure.location.coordinates[0],
      codeInsee,
      siret: structure.siret,
      nomReferent: `${structure.contact?.prenom} ${structure.contact?.nom}`,
      courrielReferent: structure.contact?.email,
      telephoneReferent: structure.contact?.telephone,
      v1Imported: new Date(),
      v1StructureId,
      v1StructureIdPg: structure.idPG,
    },
    select: {
      id: true,
    },
  })

  v1StructuresIdsMap.set(structure._id.toString(), {
    id: created.id,
    codePostal: structure.adresseInsee2Ban?.postcode ?? '',
    commune: structure.adresseInsee2Ban?.city ?? '',
    codeInsee: structure.codeCommune ?? structure.adresseInsee2Ban?.citycode,
  })
}

const batchSize = 10
export const migrateStructuresV1 = async ({
  structures,
  v1StructuresIdsMap,
}: {
  structures: StructureV1Document[]
  v1StructuresIdsMap: Map<string, V2StructureMapValue> // used to map v1 structure id to v2 structure info for deduplication and later cra mappings
}) => {
  const chunks = chunk(structures, batchSize)

  for (const chunkIndex in chunks) {
    const chunk = chunks[chunkIndex]
    await Promise.all(
      chunk.map((structure) =>
        migrateStructureV1({ structure, v1StructuresIdsMap }),
      ),
    )

    const done = Number(chunkIndex) * batchSize + chunk.length
    output(
      `Migrated ${numberToString(done)}/${numberToString(structures.length)} (${numberToPercentage((100 * done) / structures.length)}) structures`,
    )
  }
}
