import type { CraConseillerNumeriqueCollectionItem } from '@app/web/external-apis/conseiller-numerique/CraConseillerNumerique'
import {
  conseillerNumeriqueMongoCollection,
  objectIdFromString,
} from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import type { StructureConseillerNumerique } from '@app/web/external-apis/conseiller-numerique/StructureConseillerNumerique'
import { prismaClient } from '@app/web/prismaClient'
import { type Filter, ObjectId } from 'mongodb'

export type GetConseillerNumeriqueCrasOptions = {
  conseillerNumeriqueId?: string
  createdAtSince?: Date // included bound
  createdAtUntil?: Date // excluded bound
}

/**
 * Transforms a MongoDB document with _id: ObjectId to an object with id: string
 */
export const objectIdToId = <T extends { _id: ObjectId }>(
  document: T,
): Omit<T, '_id'> & { id: string } => {
  const { _id, ...rest } = document
  return {
    ...rest,
    id: _id.toString(),
  } as Omit<T, '_id'> & { id: string }
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
  // Build filter for CRAs
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

  // Fetch all data in parallel: CRAs, structures, and permanences
  const [cras, allStructures, allPermanences] = await Promise.all([
    conseillerNumeriqueMongoCollection<CraConseillerNumeriqueCollectionItem>(
      'cras',
    ).then((collection) =>
      collection
        .find(filter)
        .sort({ createdAt: 1 })
        .toArray()
        .then((documents) => documents.map(objectIdToId)),
    ),
    conseillerNumeriqueMongoCollection<StructureConseillerNumerique>(
      'structures',
    ).then((collection) =>
      collection
        .find()
        .project<
          Pick<
            StructureConseillerNumerique,
            | '_id'
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
          >
        >({
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
        .then((documents) => documents.map(objectIdToId)),
    ),
    conseillerNumeriqueMongoCollection('permanences').then((collection) =>
      collection
        .find()
        .toArray()
        .then((documents) => documents.map(objectIdToId)),
    ),
  ])

  if (cras.length === 0) {
    return {
      empty: true as const,
    }
  }

  // Index structures and permanences for fast lookup
  const indexedStructures = new Map(
    allStructures.map((structure) => [structure.id, structure]),
  )

  const indexedPermanences = new Map(
    allPermanences.map((permanence) => [permanence.id, permanence]),
  )

  // Map CRAs with their related data
  const cleanCrasWithStructures = cras.map((cra) => {
    const structure =
      indexedStructures.get(cra.structure.oid.toString()) ?? null

    const permanence =
      indexedPermanences.get(cra.permanence?.oid.toString() ?? '_missing') ??
      null

    // const { duree, organismes, ...craRest } = cra.cra
    // TODO Debug and format organismes in toPrismaModel
    const { duree, ...craRest } = cra.cra

    return {
      id: cra.id,
      createdAt: cra.createdAt,
      updatedAt: cra.updatedAt,
      conseillerId: cra.conseiller.oid.toString(),
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
    structures: allStructures,
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
