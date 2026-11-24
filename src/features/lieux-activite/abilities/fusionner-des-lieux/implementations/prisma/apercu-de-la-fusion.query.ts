import { prismaClient } from '@/configuration/prisma/prisma-client'
import { champsCommuns, type FusionApercue } from '../../domain'
import { lieuAFusionnerInclude } from './lieu-a-fusionner.select'
import { lieuAFusionnerToDomain } from './lieu-a-fusionner.transfer'

const SANS_EMPLOYEUSE = {
  employesIds: [],
  activitesEmployeurIds: [],
}

export const apercuDeLaFusion = async (
  sourceStructureId: string,
  targetStructureId: string,
): Promise<FusionApercue | null> => {
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
