import { prismaClient } from '@/configuration/prisma'
import { toTitleCase } from '@/libraries/texte'

export const lieuAFusionner = async (structureId: string) => {
  const structure = await prismaClient.lieuInclusion.findUnique({
    where: { id: structureId },
  })

  if (!structure) return null

  return {
    nom: toTitleCase(structure.nom, { noUpper: true }),
  }
}
