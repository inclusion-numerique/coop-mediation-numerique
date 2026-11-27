import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import { colonnesDeLEcriture } from '../../../../implementations/prisma/registre/colonnes-a-ecrire.select'
import { ecrireLeLieuAuRegistre } from '../../../../implementations/prisma/registre/ecrire-au-registre.mutation'
import { inscriptionPourLIdentifiantCarto } from '../../../../implementations/prisma/registre/identifiants-carto.query'
import { retirerDuRegistre } from '../../../../implementations/prisma/registre/retirer-du-registre.mutation'
import type { FicheFusionnable, FusionDeLieux } from '../../domain'
import type { FusionDesLieux, FusionnerLesLieux } from '../../domain/ports'
import { colonnesDeLaFicheFusionnee } from './fiche-fusionnable.transfer'

type PrismaTransaction = Prisma.TransactionClient

const transfererLesMediateurs = async (
  prisma: PrismaTransaction,
  {
    source,
    cible,
    mediateursATransferer,
  }: Pick<FusionDeLieux, 'source' | 'cible' | 'mediateursATransferer'>,
) => {
  await prisma.mediateurEnActivite.updateMany({
    where: {
      structureId: source,
      suppression: null,
      mediateurId: { in: [...mediateursATransferer] },
    },
    data: { structureId: cible },
  })

  await prisma.mediateurEnActivite.deleteMany({
    where: { structureId: source },
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

const fusionnerAuRegistre = async (
  prisma: PrismaTransaction,
  {
    source,
    cible,
    fusionneLe,
    ecritureAuRegistre,
  }: Pick<
    FusionDeLieux,
    'source' | 'cible' | 'fusionneLe' | 'ecritureAuRegistre'
  >,
) => {
  await retirerDuRegistre(prisma, { lieuId: source, maintenant: fusionneLe })

  const fusionne = await prisma.lieuInclusion.findUniqueOrThrow({
    where: { id: cible },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  await ecrireLeLieuAuRegistre(prisma, {
    ligne: fusionne,
    colonnes: colonnesDeLEcriture[ecritureAuRegistre],
    maintenant: fusionneLe,
  })
}

const existe = async (
  prisma: PrismaTransaction,
  lieu: LieuId,
): Promise<boolean> =>
  (await prisma.lieuInclusion.count({ where: { id: lieu } })) === 1

const lieuDisparu = async (
  prisma: PrismaTransaction,
  { source, cible }: Pick<FusionDeLieux, 'source' | 'cible'>,
): Promise<LieuId | null> => {
  if (!(await existe(prisma, source))) return source
  return (await existe(prisma, cible)) ? null : cible
}

export const fusionnerLesLieux: FusionnerLesLieux = async (fusion) =>
  prismaClient.$transaction(async (prisma): Promise<FusionDesLieux> => {
    const { source, cible, fusionneLe, fiche } = fusion
    const disparu = await lieuDisparu(prisma, fusion)

    if (disparu !== null) return { _tag: 'LieuDisparu', lieuId: disparu }

    await transfererLesMediateurs(prisma, fusion)
    await mergeActivitesLieu(prisma)(source, cible)
    await ecrireLaFicheFusionnee(prisma, {
      cible,
      fiche,
      maintenant: fusionneLe,
    })
    await fusionnerAuRegistre(prisma, fusion)
    await deleteStructure(prisma)(source)

    return { _tag: 'Fusionnes' }
  })
