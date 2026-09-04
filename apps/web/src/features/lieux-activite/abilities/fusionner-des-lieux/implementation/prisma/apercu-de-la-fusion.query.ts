import { getCorrelatedEmployeuseRelations } from '@app/web/features/lieux-activite/db/employeuse-correlee'
import { prismaClient } from '@app/web/prismaClient'
import { champsCommuns, lieuAFusionnerInclude } from '../../domain'
import { lieuAFusionnerToDomain } from './lieu-a-fusionner.transfer'

export type { ChampsPartageables, LieuAFusionner } from '../../domain'

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

  // Relations employeuses corrélées par nom + code INSEE (pas de lien FK lieu↔employeuse).
  const [sourceEmployeuse, targetEmployeuse] = await Promise.all([
    getCorrelatedEmployeuseRelations(sourceStructure),
    getCorrelatedEmployeuseRelations(targetStructure),
  ])

  const mergeSource = lieuAFusionnerToDomain(sourceStructure, sourceEmployeuse)
  const mergeTarget = lieuAFusionnerToDomain(targetStructure, targetEmployeuse)

  return {
    mergeSource,
    mergeTarget,
    mergeCommon: champsCommuns(mergeSource, mergeTarget),
  }
}

export type FusionApercue = Awaited<ReturnType<typeof apercuDeLaFusion>>
