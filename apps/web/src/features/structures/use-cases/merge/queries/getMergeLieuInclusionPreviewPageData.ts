import { getCorrelatedEmployeuseRelations } from '@app/web/features/structures/correlateStructureAdministrative'
import { prismaClient } from '@app/web/prismaClient'
import { findMergeCommonFields } from '../mappers/findMergeCommonFields'
import { presentMergeLieuInclusion } from '../presenters/presentMergeLieuInclusion'
import { mergeLieuInclusionInclude } from '../types'

export type { MergeLieuInclusionData, MergeLieuInclusionInfo } from '../types'

export const getMergeLieuInclusionPreviewPageData = async (
  sourceStructureId: string,
  targetStructureId: string,
) => {
  const [sourceStructure, targetStructure] = await Promise.all([
    prismaClient.lieuInclusion.findUnique({
      where: { id: sourceStructureId },
      include: mergeLieuInclusionInclude,
    }),
    prismaClient.lieuInclusion.findUnique({
      where: { id: targetStructureId },
      include: mergeLieuInclusionInclude,
    }),
  ])

  if (!sourceStructure || !targetStructure) return null

  // Relations employeuses corrélées par nom + code INSEE (pas de lien FK lieu↔employeuse).
  const [sourceEmployeuse, targetEmployeuse] = await Promise.all([
    getCorrelatedEmployeuseRelations(sourceStructure),
    getCorrelatedEmployeuseRelations(targetStructure),
  ])

  const mergeSource = presentMergeLieuInclusion(
    sourceStructure,
    sourceEmployeuse,
  )
  const mergeTarget = presentMergeLieuInclusion(
    targetStructure,
    targetEmployeuse,
  )

  return {
    mergeSource,
    mergeTarget,
    mergeCommon: findMergeCommonFields(mergeSource, mergeTarget),
  }
}

export type MergeLieuInclusionSourceAndTargetData = Awaited<
  ReturnType<typeof getMergeLieuInclusionPreviewPageData>
>
