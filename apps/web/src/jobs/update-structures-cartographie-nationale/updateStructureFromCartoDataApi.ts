import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { coopCartographieNationaleSource } from '@app/web/structure/cartographieNationaleSources'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { SchemaLieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { PrismaClient, Structure } from '@prisma/client'
import { structureCartographieNationaleToPrismaModel } from './transform/structureCartographieNationaleToPrismaModel'
import { structureToPrismaModel } from './transform/structureToPrismaModel'

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

type CoopIdsToMergeInSingleStructure = {
  coopIds: string[]
  structure: SchemaLieuMediationNumerique
}

const reset = async (
  prisma: PrismaTransaction,
  structuresCartographieNationale: SchemaLieuMediationNumerique[],
  now: Date,
) => {
  await prisma.structure.updateMany({
    data: { structureCartographieNationaleId: null },
  })
  const deleted = await prisma.structureCartographieNationale.deleteMany()
  const created = await prisma.structureCartographieNationale.createMany({
    data: structuresCartographieNationale.map((structure) => ({
      ...structureCartographieNationaleToPrismaModel(structure),
      creationImport: now,
      modificationImport: now,
      creation: now,
      modification: now,
    })),
  })
  return { deleted: deleted.count, created: created.count }
}

const latestChangesFromCoop = (structure: SchemaLieuMediationNumerique) =>
  structure.source === coopCartographieNationaleSource

/**
 * Determines if we should track an external modification source.
 * This happens when:
 * - The source is NOT from coop (external source)
 * - AND the cartographie nationale modification date is more recent than the coop structure modification date
 */
const getExternalModificationData = (
  structure: SchemaLieuMediationNumerique,
  existingStructure: Structure,
): {
  derniereModificationSource: string
  derniereModificationParId: null
} | null => {
  if (
    structure.source === coopCartographieNationaleSource ||
    !structure.source
  ) {
    return null
  }

  const cartoModificationDate = new Date(structure.date_maj)
  if (cartoModificationDate <= existingStructure.modification) {
    return null
  }

  return {
    derniereModificationSource: structure.source,
    derniereModificationParId: null,
  }
}

const COOP_ID_PREFIX = 'Coop-numérique_'
const ID_SEPARATOR = '__'

const extractCoopIds = (structureId: string): string[] =>
  structureId
    .split(ID_SEPARATOR)
    .filter((id: string) => id.startsWith(COOP_ID_PREFIX))
    .map((id: string) => id.replace(COOP_ID_PREFIX, ''))

const atLeastOneCoopId = ({ id }: { id: string }) =>
  extractCoopIds(id).length > 0

const groupCoopIdsByCartoghraphieId = (
  structure: SchemaLieuMediationNumerique,
): CoopIdsToMergeInSingleStructure => ({
  coopIds: Array.from(new Set(extractCoopIds(structure.id))),
  structure,
})

type StructureForMerge = {
  visiblePourCartographieNationale: boolean
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
  v1Imported: Date | null
  v1StructureId: string | null
  v1StructureIdPg: number | null
  v1PermanenceId: string | null
}

const latestNonNull = <T, K extends keyof T>(
  items: T[],
  key: K,
): T[K] | null => {
  const found = items.find((item) => item[key] != null)?.[key]
  return found != null ? found : null
}

const mergeStructures = async (
  prisma: PrismaTransaction,
  structureIds: string[],
): Promise<StructureForMerge> => {
  const structures = await prisma.structure.findMany({
    where: { id: { in: structureIds } },
    select: {
      visiblePourCartographieNationale: true,
      nomReferent: true,
      courrielReferent: true,
      telephoneReferent: true,
      v1Imported: true,
      v1StructureId: true,
      v1StructureIdPg: true,
      v1PermanenceId: true,
    },
    orderBy: { modification: 'desc' },
  })

  return {
    visiblePourCartographieNationale: structures.some(
      (s) => s.visiblePourCartographieNationale,
    ),
    nomReferent: latestNonNull(structures, 'nomReferent'),
    courrielReferent: latestNonNull(structures, 'courrielReferent'),
    telephoneReferent: latestNonNull(structures, 'telephoneReferent'),
    v1Imported: latestNonNull(structures, 'v1Imported'),
    v1StructureId: latestNonNull(structures, 'v1StructureId'),
    v1StructureIdPg: latestNonNull(structures, 'v1StructureIdPg'),
    v1PermanenceId: latestNonNull(structures, 'v1PermanenceId'),
  }
}

const linkToCoopStructure = async (
  prisma: PrismaTransaction,
  {
    coopIds: [structureId, ...idsToDelete],
    structure,
  }: CoopIdsToMergeInSingleStructure,
) => {
  const existingStructure = await prisma.structure.findUnique({
    where: { id: structureId },
  })

  if (!existingStructure) {
    return
  }

  if (idsToDelete.length > 0) {
    const mergedStructures = await mergeStructures(prisma, [
      structureId,
      ...idsToDelete,
    ])

    // update the activitesCount field of the new structure
    const activitesCount = await prisma.structure.aggregate({
      _sum: {
        activitesCount: true,
      },
      where: {
        id: { in: idsToDelete },
      },
    })

    const externalModificationData = getExternalModificationData(
      structure,
      existingStructure,
    )

    await Promise.all([
      prisma.employeStructure.updateMany({
        where: { structureId: { in: idsToDelete } },
        data: { structureId },
      }),
      prisma.mediateurEnActivite.updateMany({
        where: { structureId: { in: idsToDelete } },
        data: { structureId },
      }),
      prisma.activite.updateMany({
        where: { structureId: { in: idsToDelete } },
        data: { structureId },
      }),
      prisma.activite.updateMany({
        where: { structureEmployeuseId: { in: idsToDelete } },
        data: { structureEmployeuseId: structureId },
      }),
      prisma.structure.update({
        where: { id: structureId },
        data: {
          ...mergedStructures,
          ...(latestChangesFromCoop(structure)
            ? structureToPrismaModel(structure)
            : {}),
          ...externalModificationData,
          activitesCount: {
            increment: activitesCount._sum.activitesCount ?? 0,
          },
          structureCartographieNationaleId: structure.id,
        },
      }),
    ])

    await prisma.structure.deleteMany({
      where: { id: { in: idsToDelete } },
    })
  } else {
    const externalModificationData = getExternalModificationData(
      structure,
      existingStructure,
    )

    await prisma.structure.update({
      where: { id: structureId },
      data: {
        ...(latestChangesFromCoop(structure)
          ? structureToPrismaModel(structure)
          : {}),
        ...externalModificationData,
        structureCartographieNationaleId: structure.id,
      },
    })
  }
}

const removeMediateursEnActiviteLinks = async (prisma: PrismaTransaction) => {
  const duplicatedLieuxActiviteLinks = await prisma.$queryRaw<{ id: string }[]>`
    WITH ranked AS (
      SELECT
        id,
        mediateur_id,
        structure_id,
        creation,
        ROW_NUMBER() OVER (
          PARTITION BY mediateur_id, structure_id
          ORDER BY creation ASC
        ) AS rn
      FROM mediateurs_en_activite
      WHERE suppression IS NULL AND fin_activite IS NULL
    )
    SELECT id FROM ranked WHERE rn > 1
  `

  if (duplicatedLieuxActiviteLinks.length > 0) {
    await prisma.mediateurEnActivite.deleteMany({
      where: {
        id: { in: duplicatedLieuxActiviteLinks.map(({ id }) => id) },
      },
    })
  }

  return duplicatedLieuxActiviteLinks
}

const removeDuplicatedStructureEmployeuseLinks = async (
  prisma: PrismaTransaction,
) => {
  const duplicatedStructureEmployeuseLinks = await prisma.$queryRaw<
    { id: string }[]
  >`
    WITH ranked AS (
      SELECT
        id,
        user_id,
        structure_id,
        creation,
        ROW_NUMBER() OVER (
          PARTITION BY user_id, structure_id
          ORDER BY creation ASC
        ) AS rn
      FROM employes_structures
      WHERE suppression IS NULL AND fin_emploi IS NULL
    )
    SELECT id FROM ranked WHERE rn > 1
  `

  if (duplicatedStructureEmployeuseLinks.length > 0) {
    await prisma.employeStructure.deleteMany({
      where: {
        id: { in: duplicatedStructureEmployeuseLinks.map((d) => d.id) },
      },
    })
  }

  return duplicatedStructureEmployeuseLinks
}

export const updateStructureFromCartoDataApi =
  ({
    structuresCartographieNationale,
    now = new Date(),
  }: {
    structuresCartographieNationale: SchemaLieuMediationNumerique[]
    now?: Date
  }) =>
  async () => {
    const stopwatch = createStopwatch()

    const result = await prismaClient.$transaction(
      async (prisma) => {
        output('1. Reset structures from cartographie nationale')
        const { created, deleted } = await reset(
          prisma,
          structuresCartographieNationale,
          now,
        )

        output('2. Find structures linked to cartographie nationale')
        const structuresLinkedToCarto = structuresCartographieNationale
          .filter(atLeastOneCoopId)
          .map(groupCoopIdsByCartoghraphieId)

        output(
          `3. link ${structuresLinkedToCarto.length} structures from cartographie nationale to coop structures`,
        )
        for (const structureLinkedToCarto of structuresLinkedToCarto) {
          await linkToCoopStructure(prisma, structureLinkedToCarto)
        }

        output(
          '4. remove duplicates mediateurs en activite and employe structures links',
        )

        const duplicatedLieuxActiviteLinks =
          await removeMediateursEnActiviteLinks(prisma)

        output(
          `${duplicatedLieuxActiviteLinks.length} duplicated mediateurs_en_activite links removed`,
        )

        const duplicatedStructureEmployeuseLinks =
          await removeDuplicatedStructureEmployeuseLinks(prisma)

        output(
          `${duplicatedStructureEmployeuseLinks.length} duplicated employes_structures links removed`,
        )

        return {
          deleted,
          created,
          structuresLinkedToCartoCount: structuresLinkedToCarto.length,
        }
      },
      { maxWait: 10_000, timeout: 30 * 60 * 1000 },
    )

    output('5. updated finished successfully')
    addMutationLog({
      userId: null,
      nom: 'MiseAJourStructuresCartographieNationale',
      duration: stopwatch.stop().duration,
      data: {
        deleted: result.deleted,
        created: result.created,
        structuresLinkedToCarto: result.structuresLinkedToCartoCount,
      },
    })
  }
