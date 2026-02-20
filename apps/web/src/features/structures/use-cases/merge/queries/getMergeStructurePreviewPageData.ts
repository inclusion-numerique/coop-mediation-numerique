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
    prismaClient.structure.findUnique({
      where: { id: sourceStructureId },
      include: mergeStructureInclude,
    }),
    prismaClient.structure.findUnique({
      where: { id: targetStructureId },
      include: mergeStructureInclude,
    }),
  ])

  if (!sourceStructure || !targetStructure) return null

  const mergeSource = presentMergeStructure(sourceStructure)
  const mergeTarget = presentMergeStructure(targetStructure)

  return {
    mergeSource,
    mergeTarget,
    mergeCommon: findMergeCommonFields(mergeSource, mergeTarget),
  }
}

export type MergeStructureSourceAndTargetData = Awaited<
  ReturnType<typeof getMergeStructurePreviewPageData>
>
