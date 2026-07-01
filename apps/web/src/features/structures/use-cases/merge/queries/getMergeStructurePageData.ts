import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'

export const getMergeStructurePageData = async (structureId: string) => {
  const structure = await prismaClient.lieuInclusion.findUnique({
    where: { id: structureId },
  })

  if (!structure) return null

  return {
    nom: toTitleCase(structure.nom, { noUpper: true }),
  }
}
