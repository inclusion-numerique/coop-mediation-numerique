import { prismaClient } from '@app/web/prismaClient'
import { champsCommuns, lieuAFusionnerInclude } from '../../domain'
import { lieuAFusionnerToDomain } from './lieu-a-fusionner.transfer'

export type { ChampsPartageables, LieuAFusionner } from '../../domain'

/**
 * L'employeuse ne se relie plus au lieu (ADR-002 : elle vit dans
 * `main.structure_administrative`, sans clé étrangère vers le lieu). La
 * corrélation par nom + adresse qui les rapprochait autrefois ne matche plus,
 * et l'aperçu de fusion n'a donc rien à annoncer côté employeuse. Le domaine
 * garde les deux listes — c'est là que le comptage reviendra s'il est refait
 * sur `personne_affectations_emploi`.
 */
const SANS_EMPLOYEUSE = {
  employesIds: [] as string[],
  activitesEmployeurIds: [] as string[],
}

export const apercuDeLaFusion = async (
  sourceStructureId: string,
  targetStructureId: string,
) => {
  const [sourceStructure, targetStructure] = await Promise.all([
    prismaClient.lieuInclusion.findUnique({
      where: { id: sourceStructureId },
      include: lieuAFusionnerInclude,
    }),
    prismaClient.lieuInclusion.findUnique({
      where: { id: targetStructureId },
      include: lieuAFusionnerInclude,
    }),
  ])

  if (!sourceStructure || !targetStructure) return null

  const mergeSource = lieuAFusionnerToDomain(sourceStructure, SANS_EMPLOYEUSE)
  const mergeTarget = lieuAFusionnerToDomain(targetStructure, SANS_EMPLOYEUSE)

  return {
    mergeSource,
    mergeTarget,
    mergeCommon: champsCommuns(mergeSource, mergeTarget),
  }
}

export type FusionApercue = Awaited<ReturnType<typeof apercuDeLaFusion>>
