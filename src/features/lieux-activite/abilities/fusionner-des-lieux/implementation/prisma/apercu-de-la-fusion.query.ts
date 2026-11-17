import { prismaClient } from '@app/web/prismaClient'
import { champsCommuns } from '../../domain'
import { lieuAFusionnerInclude } from './lieu-a-fusionner.data'
import { lieuAFusionnerToDomain } from './lieu-a-fusionner.transfer'

export type { ChampsPartageables, LieuAFusionner } from '../../domain'

const SANS_EMPLOYEUSE = {
  employesIds: [],
  activitesEmployeurIds: [],
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
