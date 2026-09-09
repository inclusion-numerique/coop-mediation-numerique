import { prismaClient } from '@app/web/prismaClient'
import { unionArrays } from '@app/web/utils/unionArrays'
import type { LieuInclusion, PrismaClient } from '@prisma/client'
import {
  ecrireLeLieuAuRegistre,
  inscriptionPourLIdentifiantCarto,
  retirerDuRegistre,
} from '../../../../implementation'

type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

// "Already on the target" must mean the same thing the UI considers a live
// link — otherwise a finished record on the target silently swallows the
// source link (hard-deleted by deleteMany below) and the user ends up with
// nothing visible. Align the visibility filter with the listing query.

const mergeEmployes =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const targetEmplois = await prisma.employeStructure.findMany({
      where: {
        structureId: targetStructureId,
        suppression: null,
        OR: [{ fin: null }, { fin: { gte: new Date() } }],
      },
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
      where: {
        structureId: targetStructureId,
        suppression: null,
        fin: null,
      },
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

/**
 * Ce que la fiche absorbée lègue à celle qui reste, quand celle-ci ne le dit
 * pas : le contact du référent et les identifiants de l'import v1.
 *
 * La cible prime — c'est elle que l'administration a choisi de garder — et la
 * source ne comble que les vides. Rien ne se perd, rien ne s'écrase.
 */
const legs = <Champ extends keyof LieuInclusion>(
  source: LieuInclusion,
  target: LieuInclusion,
  champ: Champ,
): LieuInclusion[Champ] => target[champ] ?? source[champ]

const fusionnerLesChamps =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const [source, target] = await Promise.all([
      prisma.lieuInclusion.findUnique({ where: { id: sourceStructureId } }),
      prisma.lieuInclusion.findUnique({ where: { id: targetStructureId } }),
    ])

    if (!source || !target) return

    await prisma.lieuInclusion.update({
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
        // La publication sur la carte nationale ne se déduit pas d'une fusion :
        // il faut que les deux fiches l'aient été pour que celle qui reste le
        // soit. Publier parce que l'une des deux l'était exposerait un lieu que
        // son second dossier gardait volontairement à l'écart.
        visiblePourCartographieNationale:
          target.visiblePourCartographieNationale &&
          source.visiblePourCartographieNationale,
        nomReferent: legs(source, target, 'nomReferent'),
        courrielReferent: legs(source, target, 'courrielReferent'),
        telephoneReferent: legs(source, target, 'telephoneReferent'),
        v1Imported: legs(source, target, 'v1Imported'),
        v1StructureId: legs(source, target, 'v1StructureId'),
        v1StructureIdPg: legs(source, target, 'v1StructureIdPg'),
        v1PermanenceId: legs(source, target, 'v1PermanenceId'),
        modification: new Date(),
      },
    })
  }

const deleteStructure =
  (prisma: PrismaTransaction) => async (structureId: string) => {
    await prisma.lieuInclusion.delete({
      where: { id: structureId },
    })
  }

/**
 * Répercuter la fusion au registre de l'Entrepôt.
 *
 * Le lieu absorbé y garde sa ligne, marquée supprimée : le registre sert
 * d'autres consommateurs que la coop, à qui l'effacement pur et simple d'un lieu
 * ne dirait rien de ce qui lui est arrivé. Le lieu qui reste, lui, a récupéré
 * les valeurs des deux fiches — il se réécrit en entier, relu depuis la coop,
 * puisque c'est cet état-là qui fait désormais foi.
 */
const fusionnerAuRegistre =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    const maintenant = new Date()

    await retirerDuRegistre(prisma, { lieuId: sourceStructureId, maintenant })

    const fusionne = await prisma.lieuInclusion.findUnique({
      where: { id: targetStructureId },
      include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
    })

    if (!fusionne) return

    await ecrireLeLieuAuRegistre(prisma, { ligne: fusionne, maintenant })
  }

export const fusionnerDesLieux = async (
  sourceStructureId: string,
  targetStructureId: string,
  options?: { timeout?: number },
): Promise<void> => {
  await prismaClient.$transaction(
    async (prisma) => {
      const [sourceStructure, targetStructure] = await Promise.all([
        prisma.lieuInclusion.findUnique({
          where: { id: sourceStructureId },
          select: { id: true },
        }),
        prisma.lieuInclusion.findUnique({
          where: { id: targetStructureId },
          select: { id: true },
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
      await fusionnerLesChamps(prisma)(sourceStructureId, targetStructureId)

      await fusionnerAuRegistre(prisma)(sourceStructureId, targetStructureId)

      await deleteStructure(prisma)(sourceStructureId)
    },
    { timeout: options?.timeout },
  )
}
