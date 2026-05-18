import { prismaClient } from '@app/web/prismaClient'
import { unionArrays } from '@app/web/utils/unionArrays'
import type { PrismaClient } from '@prisma/client'

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

const mergeEmployes =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const targetEmplois = await prisma.employeStructure.findMany({
      where: { structureId: targetStructureId, suppression: null },
      select: { userId: true },
    })
    const targetUserIds = targetEmplois.map((e) => e.userId)

    await prisma.employeStructure.updateMany({
      where: {
        structureId: sourceStructureId,
        suppression: null,
        userId: { notIn: targetUserIds },
      },
      data: { structureId: targetStructureId },
    })

    await prisma.employeStructure.deleteMany({
      where: { structureId: sourceStructureId },
    })
  }

const mergeMediateursEnActivite =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const targetActivites = await prisma.mediateurEnActivite.findMany({
      where: { structureId: targetStructureId, suppression: null },
      select: { mediateurId: true },
    })
    const targetMediateurIds = targetActivites.map((a) => a.mediateurId)

    await prisma.mediateurEnActivite.updateMany({
      where: {
        structureId: sourceStructureId,
        suppression: null,
        mediateurId: { notIn: targetMediateurIds },
      },
      data: { structureId: targetStructureId },
    })

    await prisma.mediateurEnActivite.deleteMany({
      where: { structureId: sourceStructureId },
    })
  }

const mergeActivitesEmployeur =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    await prisma.activite.updateMany({
      where: { structureEmployeuseId: sourceStructureId },
      data: { structureEmployeuseId: targetStructureId },
    })
  }

const mergeActivitesLieu =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    await prisma.activite.updateMany({
      where: { structureId: sourceStructureId },
      data: { structureId: targetStructureId },
    })
  }

const mergeCartographieNationaleIds =
  (prisma: PrismaTransaction) =>
  async (
    sourceStructure: {
      id: string
      structureCartographieNationaleId: string | null
    },
    targetStructure: {
      id: string
      structureCartographieNationaleId: string | null
    },
  ) => {
    if (sourceStructure.structureCartographieNationaleId) {
      const cartoSource =
        await prisma.structureCartographieNationale.findUnique({
          where: { id: sourceStructure.structureCartographieNationaleId },
        })

      if (cartoSource && cartoSource.coopIds.includes(sourceStructure.id)) {
        const newCoopIds = cartoSource.coopIds.filter(
          (id) => id !== sourceStructure.id,
        )
        if (!newCoopIds.includes(targetStructure.id)) {
          newCoopIds.push(targetStructure.id)
        }

        await prisma.structureCartographieNationale.update({
          where: { id: sourceStructure.structureCartographieNationaleId },
          data: { coopIds: newCoopIds },
        })
      }
    }
  }

const mergeArrayFields =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const [source, target] = await Promise.all([
      prisma.structure.findUnique({ where: { id: sourceStructureId } }),
      prisma.structure.findUnique({ where: { id: targetStructureId } }),
    ])

    if (!source || !target) return

    await prisma.structure.update({
      where: { id: targetStructureId },
      data: {
        typologies: unionArrays(target.typologies, source.typologies),
        services: unionArrays(target.services, source.services),
        publicsSpecifiquementAdresses: unionArrays(
          target.publicsSpecifiquementAdresses,
          source.publicsSpecifiquementAdresses,
        ),
        priseEnChargeSpecifique: unionArrays(
          target.priseEnChargeSpecifique,
          source.priseEnChargeSpecifique,
        ),
        fraisACharge: unionArrays(target.fraisACharge, source.fraisACharge),
        dispositifProgrammesNationaux: unionArrays(
          target.dispositifProgrammesNationaux,
          source.dispositifProgrammesNationaux,
        ),
        formationsLabels: unionArrays(
          target.formationsLabels,
          source.formationsLabels,
        ),
        autresFormationsLabels: unionArrays(
          target.autresFormationsLabels,
          source.autresFormationsLabels,
        ),
        itinerance: unionArrays(target.itinerance, source.itinerance),
        modalitesAcces: unionArrays(
          target.modalitesAcces,
          source.modalitesAcces,
        ),
        modalitesAccompagnement: unionArrays(
          target.modalitesAccompagnement,
          source.modalitesAccompagnement,
        ),
        courriels: unionArrays(target.courriels, source.courriels),
        activitesCount: { increment: source.activitesCount },
        modification: new Date(),
      },
    })
  }

const deleteStructure =
  (prisma: PrismaTransaction) => async (structureId: string) => {
    await prisma.structure.delete({
      where: { id: structureId },
    })
  }

export const mergeStructure = async (
  sourceStructureId: string,
  targetStructureId: string,
  options?: { timeout?: number; propagateVisibility?: boolean },
): Promise<void> => {
  await prismaClient.$transaction(
    async (prisma) => {
      const [sourceStructure, targetStructure] = await Promise.all([
        prisma.structure.findUnique({
          where: { id: sourceStructureId },
          select: {
            id: true,
            structureCartographieNationaleId: true,
            visiblePourCartographieNationale: true,
          },
        }),
        prisma.structure.findUnique({
          where: { id: targetStructureId },
          select: {
            id: true,
            structureCartographieNationaleId: true,
            visiblePourCartographieNationale: true,
          },
        }),
      ])

      if (!sourceStructure || !targetStructure) {
        throw new Error('Une ou les deux structures sont introuvables')
      }

      await mergeEmployes(prisma)(sourceStructureId, targetStructureId)
      await mergeMediateursEnActivite(prisma)(
        sourceStructureId,
        targetStructureId,
      )
      await mergeActivitesEmployeur(prisma)(
        sourceStructureId,
        targetStructureId,
      )
      await mergeActivitesLieu(prisma)(sourceStructureId, targetStructureId)
      await mergeCartographieNationaleIds(prisma)(
        sourceStructure,
        targetStructure,
      )
      await mergeArrayFields(prisma)(sourceStructureId, targetStructureId)

      if (
        options?.propagateVisibility &&
        sourceStructure.visiblePourCartographieNationale &&
        !targetStructure.visiblePourCartographieNationale
      ) {
        await prisma.structure.update({
          where: { id: targetStructureId },
          data: { visiblePourCartographieNationale: true },
        })
      }

      await deleteStructure(prisma)(sourceStructureId)
    },
    { timeout: options?.timeout },
  )
}
