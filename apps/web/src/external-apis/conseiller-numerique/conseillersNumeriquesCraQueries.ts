import type { CraConseillerNumeriqueCollectionItem } from '@app/web/external-apis/conseiller-numerique/CraConseillerNumerique'
import {
  conseillerNumeriqueMongoCollection,
  objectIdFromString,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import type { StructureConseillerNumerique } from '@app/web/external-apis/conseiller-numerique/StructureConseillerNumerique'
import { prismaClient } from '@app/web/prismaClient'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import { type Filter, ObjectId } from 'mongodb'

export type GetConseillerNumeriqueCrasOptions = {
  conseillerNumeriqueId?: string
  createdAtSince?: Date // included bound
  createdAtUntil?: Date // excluded bound
}

export const vacuumAnalyzeConseillerNumeriqueV1Cras = async () => {
  await prismaClient.$queryRaw`
      VACUUM ANALYZE "cras_conseiller_numerique_v1"
    `
}

export const getConseillerNumeriqueCrasFromMongo = async ({
  createdAtSince,
  createdAtUntil,
  conseillerNumeriqueId,
}: GetConseillerNumeriqueCrasOptions) => {
  const crasCollection =
    await conseillerNumeriqueMongoCollection<CraConseillerNumeriqueCollectionItem>(
      'cras',
    )

  // Cras collection has _id, conseiller as an ref object {$ref: "conseillers", $id: ObjectId}, createdAt, structure as an ref object {$ref: "structures", $id: ObjectId}
  // and "cra" as an object with the fields of the CRA
  // We want to join with structure, but no need to join with conseiller
  // Order by createdAt ASC

  const filter: Filter<CraConseillerNumeriqueCollectionItem> = {}

  if (createdAtSince) {
    filter.createdAt = { $gte: createdAtSince }
  }
  if (createdAtUntil) {
    filter.createdAt = {
      ...(filter.createdAt ?? null),
      $lt: createdAtUntil,
    }
  }
  if (conseillerNumeriqueId) {
    const objectId = objectIdFromString(conseillerNumeriqueId)
    if (objectId) {
      ;(filter as any)['conseiller._id'] = objectId
    }
  }

  const cras = await crasCollection
    .find(filter)
    .sort({ createdAt: 1 })
    .toArray()

  if (cras.length === 0) {
    return {
      empty: true as const,
    }
  }

  const uniquePermanenceId = new Set(
    cras
      .map(({ permanence }) => permanence?.oid.toString())
      .filter(isDefinedAndNotNull),
  )

  const permanencesCollection =
    await conseillerNumeriqueMongoCollection('permanences')

  const permanences = await permanencesCollection
    .find({
      _id: { $in: [...uniquePermanenceId].map(ObjectId.createFromHexString) },
    })
    .toArray()

  const indexedPermanences = new Map(
    permanences.map((permanence) => [
      (permanence as unknown as { id: string }).id,
      permanence,
    ]),
  )

  const uniqueStructureIds = new Set(
    cras.map(({ structure }) => structure.oid.toString()),
  )

  for (const permanence of permanences) {
    uniqueStructureIds.add(
      (permanence.structure as unknown as { oid: ObjectId }).oid.toString(),
    )
  }

  const structuresCollection =
    await conseillerNumeriqueMongoCollection<StructureConseillerNumerique>(
      'structures',
    )

  const structures = (await structuresCollection
    // Projection, just get the fields _id, idPG, type, statut, nom, siret, codePostal, nomCommune, codeCommune,codeDepartement,codeRegion,
    .find({
      _id: {
        $in: [...uniqueStructureIds].map(ObjectId.createFromHexString),
      },
    })
    .project({
      _id: 1,
      idPG: 1,
      type: 1,
      statut: 1,
      nom: 1,
      siret: 1,
      codePostal: 1,
      nomCommune: 1,
      codeCommune: 1,
      codeDepartement: 1,
      codeRegion: 1,
    })
    .toArray()
    .then((documents) =>
      documents.map((structure) => {
        // flatten oid
        const { _id: oid, ...rest } = structure

        return {
          id: (oid as ObjectId).toString(),
          ...rest,
        }
      }),
    )) as (Pick<
    StructureConseillerNumerique,
    | 'idPG'
    | 'type'
    | 'statut'
    | 'nom'
    | 'siret'
    | 'codePostal'
    | 'nomCommune'
    | 'codeCommune'
    | 'codeDepartement'
    | 'codeRegion'
  > & { id: string })[]

  const indexedStructures = new Map(
    structures.map((structure) => [structure.id, structure]),
  )

  const cleanCrasWithStructures = cras.map((item) => {
    const structure =
      indexedStructures.get(item.structure.oid.toString()) ?? null

    const permanence =
      indexedPermanences.get(item.permanence?.oid.toString() ?? '_missing') ??
      null

    // const { duree, organismes, ...craRest } = item.cra
    // TODO Debug and format organismes in toPrismaModel
    const { duree, ...craRest } = item.cra

    return {
      id: item._id.toString(),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      conseillerId: item.conseiller.oid.toString(),
      cra: {
        ...craRest,
        duree: duree?.toString() ?? '',
      },
      structure,
      permanence: permanence
        ? {
            ...permanence,
            structure: indexedStructures.get(
              (
                permanence.structure as unknown as { oid: ObjectId }
              ).oid.toString(),
            ),
          }
        : null,
    }
  })

  return {
    cras: cleanCrasWithStructures,
    structures,
    expectedStructures: uniqueStructureIds.size,
    empty: false as const,
  }
}

export type GetConseillerNumeriqueCrasResult = Awaited<
  ReturnType<typeof getConseillerNumeriqueCrasFromMongo>
>

export type EmptyConseillerNumeriqueCrasResult =
  GetConseillerNumeriqueCrasResult & {
    empty: true
  }

export type NonEmptyConseillerNumeriqueCrasResult =
  GetConseillerNumeriqueCrasResult & {
    empty: false
  }

export type ConseillerNumeriqueCraWithStructure =
  NonEmptyConseillerNumeriqueCrasResult['cras'][number]
