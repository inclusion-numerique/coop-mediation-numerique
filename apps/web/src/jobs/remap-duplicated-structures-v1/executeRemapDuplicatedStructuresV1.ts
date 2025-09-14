import { output } from '@app/cli/output'
import {
  closeMongoClient,
  conseillerNumeriqueMongoCollection,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { prismaClient } from '@app/web/prismaClient'
import { StructureV1Document } from '../migrate-structures-v1/StructureV1Document'
import { v1PermanencesIdsMap } from '../migrate-structures-v1/v1PermanencesIdsMap'
import { v1StructuresIdsMap } from '../migrate-structures-v1/v1StructuresIdsMap'
import { RemapDuplicatedStructuresV1Job } from './RemapDuplicatedStructuresV1Job'
import { writeV1DeduplicatedStructuresIdsMap } from './remapDuplicatedStructuresV1'

export const executeRemapDuplicatedStructuresV1 = async (
  _job: RemapDuplicatedStructuresV1Job,
) => {
  try {
    const structuresCollection =
      await conseillerNumeriqueMongoCollection('structures')

    // First find out if there is any duplicated key between the v1StructuresIdsMap and v1PermanencesIdsMap
    for (const key of v1StructuresIdsMap.keys()) {
      if (v1PermanencesIdsMap.has(key)) {
        throw new Error(
          `Duplicated key ${key} found between v1StructuresIdsMap and v1PermanencesIdsMap`,
        )
      }
    }

    // Fetch all structures and put them in a map by stringifyed id: Map<string, StructureV1>
    const structures = (await structuresCollection
      .find()
      .sort({ updatedAt: 1 })
      .toArray()) as StructureV1Document[]
    const structuresMap = new Map(
      structures.map((structure) => [structure._id.toString(), structure]),
    )
    output(`Found ${structuresMap.size} structures`)

    const permanencesCollection =
      await conseillerNumeriqueMongoCollection('permanences')
    const permanences = await permanencesCollection
      .find()
      .sort({ updatedAt: 1 })
      .toArray()

    const permanencesMap = new Map(
      permanences.map((permanence) => [permanence._id.toString(), permanence]),
    )

    const remappedStructures = new Map<
      string,
      {
        id: string
        codePostal: string | null
        commune: string | null
        codeInsee: string | null
      }
    >()

    for (const structure of structures) {
      const v1MapResult = v1StructuresIdsMap.get(structure._id.toString())

      if (!v1MapResult) {
        throw new Error(
          `Structure ${structure._id.toString()} not found in v1StructuresIdsMap`,
        )
      }

      const v2Structure = await prismaClient.structure.findFirst({
        where: {
          OR: [
            {
              id: v1MapResult.id,
            },
            {
              structureCartographieNationaleId: { contains: v1MapResult.id },
            },
          ],
        },
        select: {
          id: true,
          codePostal: true,
          commune: true,
          codeInsee: true,
        },
      })

      if (!v2Structure) {
        throw new Error(
          `Structure ${structure._id.toString()} not found in v2 database`,
        )
      }

      remappedStructures.set(structure._id.toString(), {
        id: v2Structure.id,
        codePostal: v2Structure.codePostal,
        commune: v2Structure.commune,
        codeInsee: v2Structure.codeInsee,
      })
    }

    for (const permanence of permanences) {
      const v1MapResult = v1PermanencesIdsMap.get(permanence._id.toString())

      if (!v1MapResult) {
        throw new Error(
          `Permanence ${permanence._id.toString()} not found in v1PermanencesIdsMap`,
        )
      }

      const v2Structure = await prismaClient.structure.findFirst({
        where: {
          OR: [
            { id: v1MapResult.id },
            { structureCartographieNationaleId: { contains: v1MapResult.id } },
          ],
        },
        select: {
          id: true,
          codePostal: true,
          commune: true,
          codeInsee: true,
        },
      })

      if (!v2Structure) {
        throw new Error(
          `Permanence ${permanence._id.toString()} not found in v2 database`,
        )
      }

      remappedStructures.set(permanence._id.toString(), {
        id: v2Structure.id,
        codePostal: v2Structure.codePostal,
        commune: v2Structure.commune,
        codeInsee: v2Structure.codeInsee,
      })
    }

    await writeV1DeduplicatedStructuresIdsMap(remappedStructures)

    output(`Found ${permanencesMap.size} permanences`)
  } finally {
    await closeMongoClient()
  }
}
