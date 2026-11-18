import { prismaClient } from '@/prismaClient'
import { toTitleCase } from '@/utils/toTitleCase'

export const lieuAFusionner = async (structureId: string) => {
  const structure = await prismaClient.lieuInclusion.findUnique({
    where: { id: structureId },
  })

  if (!structure) return null

  return {
    nom: toTitleCase(structure.nom, { noUpper: true }),
  }
}
