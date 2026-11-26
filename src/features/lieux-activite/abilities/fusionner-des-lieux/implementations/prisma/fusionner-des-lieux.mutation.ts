import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { toutesLesColonnes } from '../../../../implementations/prisma/registre/colonnes-a-ecrire.select'
import { ecrireLeLieuAuRegistre } from '../../../../implementations/prisma/registre/ecrire-au-registre.mutation'
import { inscriptionPourLIdentifiantCarto } from '../../../../implementations/prisma/registre/identifiants-carto.query'
import { retirerDuRegistre } from '../../../../implementations/prisma/registre/retirer-du-registre.mutation'
import type { FicheFusionnable } from '../../domain'
import type { FusionnerLesLieux } from '../../domain/ports'
import { colonnesDeLaFicheFusionnee } from './fiche-fusionnable.transfer'

type PrismaTransaction = Prisma.TransactionClient

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

const mergeActivitesLieu =
  (prisma: PrismaTransaction) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    await prisma.activite.updateMany({
      where: { structureId: sourceStructureId },
      data: { structureId: targetStructureId },
    })
  }

const ecrireLaFicheFusionnee = async (
  prisma: PrismaTransaction,
  {
    cible,
    fiche,
    maintenant,
  }: {
    readonly cible: string
    readonly fiche: FicheFusionnable
    readonly maintenant: Date
  },
) => {
  await prisma.lieuInclusion.update({
    where: { id: cible },
    data: { ...colonnesDeLaFicheFusionnee(fiche), modification: maintenant },
  })
}

const deleteStructure =
  (prisma: PrismaTransaction) => async (structureId: string) => {
    await prisma.lieuInclusion.delete({
      where: { id: structureId },
    })
  }

const fusionnerAuRegistre =
  (prisma: PrismaTransaction, maintenant: Date) =>
  async (sourceStructureId: string, targetStructureId: string) => {
    await retirerDuRegistre(prisma, { lieuId: sourceStructureId, maintenant })

    const fusionne = await prisma.lieuInclusion.findUnique({
      where: { id: targetStructureId },
      include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
    })

    if (!fusionne) return

    await ecrireLeLieuAuRegistre(prisma, {
      ligne: fusionne,
      colonnes: toutesLesColonnes,
      maintenant,
    })
  }

const tousExistent = async (
  prisma: PrismaTransaction,
  lieux: readonly string[],
): Promise<boolean> =>
  (await prisma.lieuInclusion.count({ where: { id: { in: [...lieux] } } })) ===
  new Set(lieux).size

export const fusionnerLesLieux: FusionnerLesLieux = async ({
  source,
  cible,
  fusionneLe,
  fiche,
}) =>
  prismaClient.$transaction(async (prisma) => {
    if (!(await tousExistent(prisma, [source, cible])))
      return { fusionne: false }

    await mergeMediateursEnActivite(prisma)(source, cible)
    await mergeActivitesLieu(prisma)(source, cible)
    await ecrireLaFicheFusionnee(prisma, {
      cible,
      fiche,
      maintenant: fusionneLe,
    })
    await fusionnerAuRegistre(prisma, fusionneLe)(source, cible)
    await deleteStructure(prisma)(source)

    return { fusionne: true }
  })
