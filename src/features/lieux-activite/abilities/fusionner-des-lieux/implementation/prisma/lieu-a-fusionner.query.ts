import { prismaClient } from '@/configuration/prisma/prismaClient'
import { toTitleCase } from '@/libraries/texte/toTitleCase'

export const lieuAFusionner = async (structureId: string) => {
  const structure = await prismaClient.lieuInclusion.findUnique({
    where: { id: structureId },
  })

  if (!structure) return null

  return {
    nom: toTitleCase(structure.nom, { noUpper: true }),
  }
}
