import { prismaClient } from '@app/web/prismaClient'
import type { PrismaClient } from '@prisma/client'

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

// Fusion de deux IDENTITÉS LÉGALES EMPLOYEUSES (structure_administrative).
// Frère de `mergeStructure` (qui fusionne des LIEUX). Ici on repointe les relations
// employeuse — emplois (`employes_structures.structure_id`) et activités-employeur
// (`activites.structure_employeuse_id`) — de la source vers la cible, on complète
// l'identité de la cible, puis on supprime la source.
// La cible reste maître de son identité ; on ne comble que ses champs vides.

const mergeEmplois =
  (prisma: PrismaTransaction) =>
  async (
    sourceStructureId: string,
    targetStructureId: string,
    targetStructureMainId: number | null,
  ) => {
    // Emplois déjà présents (et vivants) sur la cible : on ne duplique pas un même user.
    const targetEmplois = await prisma.employeStructure.findMany({
      where: {
        structureId: targetStructureId,
        suppression: null,
        OR: [{ fin: null }, { fin: { gte: new Date() } }],
      },
      select: { userId: true },
    })
    const targetUserIds = targetEmplois.map((emploi) => emploi.userId)

    await prisma.employeStructure.updateMany({
      where: {
        structureId: sourceStructureId,
        suppression: null,
        userId: { notIn: targetUserIds },
      },
      // Dual-write coop->main (ADR-002 étape 6) : on repointe les deux FK vers la cible.
      data: {
        structureId: targetStructureId,
        structureMainId: targetStructureMainId,
      },
    })

    await prisma.employeStructure.deleteMany({
      where: { structureId: sourceStructureId },
    })
  }

const mergeActivitesEmployeur =
  (prisma: PrismaTransaction) =>
  async (
    sourceStructureId: string,
    targetStructureId: string,
    targetStructureMainId: number | null,
  ) => {
    await prisma.activite.updateMany({
      where: { structureEmployeuseId: sourceStructureId },
      // Dual-write coop->main (ADR-002 étape 6).
      data: {
        structureEmployeuseId: targetStructureId,
        structureEmployeuseMainId: targetStructureMainId,
      },
    })
  }

const completeTargetIdentity =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const [source, target] = await Promise.all([
      prisma.structureAdministrative.findUnique({
        where: { id: sourceStructureId },
      }),
      prisma.structureAdministrative.findUnique({
        where: { id: targetStructureId },
      }),
    ])

    if (!source || !target) return

    await prisma.structureAdministrative.update({
      where: { id: targetStructureId },
      data: {
        siret: target.siret ?? source.siret,
        rna: target.rna ?? source.rna,
        denomination: target.denomination ?? source.denomination,
        nomReferent: target.nomReferent ?? source.nomReferent,
        courrielReferent: target.courrielReferent ?? source.courrielReferent,
        telephoneReferent: target.telephoneReferent ?? source.telephoneReferent,
        modification: new Date(),
      },
    })
  }

const deleteStructureAdministrative =
  (prisma: PrismaTransaction) => async (structureId: string) => {
    await prisma.structureAdministrative.delete({ where: { id: structureId } })
  }

export const mergeStructureAdministrative = async (
  sourceStructureId: string,
  targetStructureId: string,
  options?: { timeout?: number },
): Promise<void> => {
  await prismaClient.$transaction(
    async (prisma) => {
      const [sourceStructure, targetStructure] = await Promise.all([
        prisma.structureAdministrative.findUnique({
          where: { id: sourceStructureId },
          select: { id: true },
        }),
        prisma.structureAdministrative.findUnique({
          where: { id: targetStructureId },
          select: { id: true },
        }),
      ])

      if (!sourceStructure || !targetStructure) {
        throw new Error(
          'Une ou les deux structures employeuses sont introuvables',
        )
      }

      // Id main de la cible (via structure_coop_id) pour repointer aussi les FK main (dual-write).
      const targetStructureMain =
        await prisma.structureAdministrativeMain.findUnique({
          where: { structureCoopId: targetStructureId },
          select: { id: true },
        })
      const targetStructureMainId = targetStructureMain?.id ?? null

      await mergeEmplois(prisma)(
        sourceStructureId,
        targetStructureId,
        targetStructureMainId,
      )
      await mergeActivitesEmployeur(prisma)(
        sourceStructureId,
        targetStructureId,
        targetStructureMainId,
      )
      await completeTargetIdentity(prisma)(sourceStructureId, targetStructureId)
      await deleteStructureAdministrative(prisma)(sourceStructureId)
    },
    { timeout: options?.timeout },
  )
}
