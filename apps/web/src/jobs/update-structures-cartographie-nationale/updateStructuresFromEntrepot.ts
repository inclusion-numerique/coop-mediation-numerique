import { output } from '@app/cli/output'
import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { prismaClient } from '@app/web/prismaClient'
import { coopCartographieNationaleSource } from '@app/web/structure/cartographieNationaleSources'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { PrismaClient, Structure } from '@prisma/client'

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

// Un lieu de la cartographie nationale (table main.lieu_inclusion de l'Entrepôt)
// relié à au moins une structure coop via l'id composite.
type CartoLieu = {
  // Id composite cartographie nationale : tokens `Coop-numérique_<coopId>` séparés par `__`.
  structureCartographieNationaleId: string
  source: string | null
  dateMaj: Date | null
}

type CoopIdsToMergeInSingleStructure = {
  coopIds: string[]
  lieu: CartoLieu
}

const COOP_ID_PREFIX = 'Coop-numérique_'
const ID_SEPARATOR = '__'

const extractCoopIds = (structureCartographieNationaleId: string): string[] =>
  structureCartographieNationaleId
    .split(ID_SEPARATOR)
    .filter((id: string) => id.startsWith(COOP_ID_PREFIX))
    .map((id: string) => id.replace(COOP_ID_PREFIX, ''))

const atLeastOneCoopId = ({ structureCartographieNationaleId }: CartoLieu) =>
  extractCoopIds(structureCartographieNationaleId).length > 0

const groupCoopIdsByCartographieId = (
  lieu: CartoLieu,
): CoopIdsToMergeInSingleStructure => ({
  coopIds: Array.from(
    new Set(extractCoopIds(lieu.structureCartographieNationaleId)),
  ),
  lieu,
})

/**
 * Determines if we should track an external modification source.
 * This happens when:
 * - The source is NOT from coop (external source)
 * - AND the cartographie nationale modification date is more recent than the coop structure modification date
 */
const getExternalModificationData = (
  lieu: CartoLieu,
  existingStructure: Structure,
): {
  derniereModificationSource: string
  derniereModificationParId: null
} | null => {
  if (lieu.source === coopCartographieNationaleSource || !lieu.source) {
    return null
  }

  if (!lieu.dateMaj || lieu.dateMaj <= existingStructure.modification) {
    return null
  }

  return {
    derniereModificationSource: lieu.source,
    derniereModificationParId: null,
  }
}

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
    lieu,
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
      lieu,
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
          ...externalModificationData,
          activitesCount: {
            increment: activitesCount._sum.activitesCount ?? 0,
          },
          structureCartographieNationaleId:
            lieu.structureCartographieNationaleId,
        },
      }),
    ])

    await prisma.structure.deleteMany({
      where: { id: { in: idsToDelete } },
    })
  } else {
    const externalModificationData = getExternalModificationData(
      lieu,
      existingStructure,
    )

    await prisma.structure.update({
      where: { id: structureId },
      data: {
        ...externalModificationData,
        structureCartographieNationaleId: lieu.structureCartographieNationaleId,
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

/**
 * Relie les structures coop aux lieux de la cartographie nationale en analysant
 * l'id composite `structure_cartographie_nationale_id` de `main.lieu_inclusion`
 * (Entrepôt). Remplace l'ancien job qui téléchargeait l'API carto et stockait un
 * miroir dans `coop.structures_cartographie_nationale` : la donnée vit désormais
 * dans l'Entrepôt, on n'en garde côté coop que le lien (id + visibilité).
 *
 * Les `cartoLieux` sont injectables pour les tests ; par défaut ils sont lus
 * depuis l'Entrepôt.
 */
export const updateStructuresFromEntrepot =
  ({ cartoLieux }: { cartoLieux?: CartoLieu[] } = {}) =>
  async () => {
    const stopwatch = createStopwatch()

    output(
      '1. Lecture des lieux de la cartographie nationale depuis l’Entrepôt',
    )
    const lieux =
      cartoLieux ??
      (
        await entrepotPrismaClient.lieuInclusion.findMany({
          where: {
            structureCartographieNationaleId: { contains: COOP_ID_PREFIX },
          },
          select: {
            structureCartographieNationaleId: true,
            source: true,
            updatedAt: true,
          },
        })
      ).flatMap((lieu) =>
        lieu.structureCartographieNationaleId == null
          ? []
          : [
              {
                structureCartographieNationaleId:
                  lieu.structureCartographieNationaleId,
                source: lieu.source,
                dateMaj: lieu.updatedAt,
              },
            ],
      )

    const result = await prismaClient.$transaction(
      async (prisma) => {
        output('2. Réinitialisation des liens cartographie nationale')
        const reset = await prisma.structure.updateMany({
          data: { structureCartographieNationaleId: null },
        })

        output('3. Recherche des lieux carto reliés à des structures coop')
        const structuresLinkedToCarto = lieux
          .filter(atLeastOneCoopId)
          .map(groupCoopIdsByCartographieId)

        output(
          `4. liaison de ${structuresLinkedToCarto.length} lieux carto à des structures coop`,
        )
        for (const structureLinkedToCarto of structuresLinkedToCarto) {
          await linkToCoopStructure(prisma, structureLinkedToCarto)
        }

        output(
          '5. suppression des doublons de liens médiateurs en activité et employés structures',
        )

        const duplicatedLieuxActiviteLinks =
          await removeMediateursEnActiviteLinks(prisma)

        output(
          `${duplicatedLieuxActiviteLinks.length} liens mediateurs_en_activite dupliqués supprimés`,
        )

        const duplicatedStructureEmployeuseLinks =
          await removeDuplicatedStructureEmployeuseLinks(prisma)

        output(
          `${duplicatedStructureEmployeuseLinks.length} liens employes_structures dupliqués supprimés`,
        )

        return {
          resetCount: reset.count,
          structuresLinkedToCartoCount: structuresLinkedToCarto.length,
        }
      },
      { maxWait: 10_000, timeout: 30 * 60 * 1000 },
    )

    output('6. mise à jour terminée avec succès')
    addMutationLog({
      userId: null,
      nom: 'MiseAJourStructuresCartographieNationale',
      duration: stopwatch.stop().duration,
      data: {
        resetCount: result.resetCount,
        structuresLinkedToCarto: result.structuresLinkedToCartoCount,
      },
    })

    return result
  }
