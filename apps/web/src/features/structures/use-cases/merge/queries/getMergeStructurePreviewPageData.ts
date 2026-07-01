import { getCorrelatedEmployeuseRelations } from '@app/web/features/structures/correlateStructureAdministrative'
import { prismaClient } from '@app/web/prismaClient'
import { findMergeCommonFields } from '../mappers/findMergeCommonFields'
import { presentMergeStructure } from '../presenters/presentMergeStructure'
import { mergeStructureInclude } from '../types'

export type { MergeStructureData, MergeStructureInfo } from '../types'

export const getMergeStructurePreviewPageData = async (
  sourceStructureId: string,
  targetStructureId: string,
) => {
  const [sourceStructure, targetStructure] = await Promise.all([
    prismaClient.lieuInclusion.findUnique({
      where: { id: sourceStructureId },
      include: mergeStructureInclude,
    }),
    prismaClient.lieuInclusion.findUnique({
      where: { id: targetStructureId },
      include: mergeStructureInclude,
    }),
  ])

  if (!sourceStructure || !targetStructure) return null

  // Relations employeuses corrélées par nom + code INSEE (pas de lien FK lieu↔employeuse).
  const [sourceEmployeuse, targetEmployeuse] = await Promise.all([
    getCorrelatedEmployeuseRelations(sourceStructure),
    getCorrelatedEmployeuseRelations(targetStructure),
  ])

  const mergeSource = presentMergeStructure(sourceStructure, sourceEmployeuse)
  const mergeTarget = presentMergeStructure(targetStructure, targetEmployeuse)

  return {
    mergeSource,
    mergeTarget,
    mergeCommon: findMergeCommonFields(mergeSource, mergeTarget),
  }
}

export type MergeStructureSourceAndTargetData = Awaited<
  ReturnType<typeof getMergeStructurePreviewPageData>
>
