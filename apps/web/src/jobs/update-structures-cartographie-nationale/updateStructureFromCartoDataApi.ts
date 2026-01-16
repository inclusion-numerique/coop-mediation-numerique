import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { SchemaLieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { structureCartographieNationaleToPrismaModel } from './transform/structureCartographieNationaleToPrismaModel'
import { structureToPrismaModel } from './transform/structureToPrismaModel'

type CoopIdsToMergeInSingleStructure = {
  coopIds: string[]
  structure: SchemaLieuMediationNumerique
}

const reset =
  (structuresCartographieNationale: SchemaLieuMediationNumerique[]) =>
  (now: Date) =>
    prismaClient
      .$transaction([
        prismaClient.structure.updateMany({
          data: { structureCartographieNationaleId: null },
        }),
        prismaClient.structureCartographieNationale.deleteMany(),
        prismaClient.structureCartographieNationale.createMany({
          data: structuresCartographieNationale.map((structure) => ({
            ...structureCartographieNationaleToPrismaModel(structure),
            creationImport: now,
            modificationImport: now,
            creation: now,
            modification: now,
          })),
        }),
      ])
      .then(([_preparation, deleted, created]) => ({
        deleted: deleted.count,
        created: created.count,
      }))

const latestChangesFromCoop = (structure: SchemaLieuMediationNumerique) =>
  structure.source === 'Coop numérique'

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
  structureIds: string[],
): Promise<StructureForMerge> => {
  const structures = await prismaClient.structure.findMany({
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

const linkToCoopStructure = ({
  coopIds: [structureId, ...idsToDelete],
  structure,
}: CoopIdsToMergeInSingleStructure) =>
  prismaClient.$transaction(
    async (prisma) => {
      const existingStructure = await prisma.structure.findUnique({
        where: { id: structureId },
      })

      if (!existingStructure) {
        return
      }

      if (idsToDelete.length > 0) {
        const mergedStructures = await mergeStructures([
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
        await prisma.structure.update({
          where: { id: structureId },
          data: {
            ...(latestChangesFromCoop(structure)
              ? structureToPrismaModel(structure)
              : {}),
            structureCartographieNationaleId: structure.id,
          },
        })
      }
    },
    { maxWait: 3000, timeout: 15 * 60 * 1000 },
  )

const removeMediateursEnActiviteLinks = async () => {
  const duplicatedLieuxActiviteLinks = await prismaClient.$queryRaw<
    { id: string }[]
  >`
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
    await prismaClient.mediateurEnActivite.deleteMany({
      where: {
        id: { in: duplicatedLieuxActiviteLinks.map(({ id }) => id) },
      },
    })
  }

  return duplicatedLieuxActiviteLinks
}

const removeDuplicatedStructureEmployeuseLinks = async () => {
  const duplicatedStructureEmployeuseLinks = await prismaClient.$queryRaw<
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
    await prismaClient.employeStructure.deleteMany({
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

    output('1. Reset structures from cartographie nationale')
    const { created, deleted } = await reset(structuresCartographieNationale)(
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
      await linkToCoopStructure(structureLinkedToCarto)
    }

    output(
      '4. remove duplicates mediateurs en activite and employe structures links',
    )

    const duplicatedLieuxActiviteLinks = await removeMediateursEnActiviteLinks()

    output(
      `${duplicatedLieuxActiviteLinks.length} duplicated mediateurs_en_activite links removed`,
    )

    const duplicatedStructureEmployeuseLinks =
      await removeDuplicatedStructureEmployeuseLinks()

    output(
      `${duplicatedStructureEmployeuseLinks.length} duplicated employes_structures links removed`,
    )

    output(`5. updated finished successfully`)
    addMutationLog({
      userId: null,
      nom: 'MiseAJourStructuresCartographieNationale',
      duration: stopwatch.stop().duration,
      data: {
        deleted,
        created,
        structuresLinkedToCarto: structuresLinkedToCarto.length,
      },
    })
  }
