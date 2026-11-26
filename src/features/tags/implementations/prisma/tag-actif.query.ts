import { prismaClient } from '@/configuration/prisma'
import type { LireUnTagActif } from '../../domain'
import { tagToDomain } from './tag.transfer'

export const lireUnTagActif: LireUnTagActif = async (tagId) => {
  const ligne = await prismaClient.tag.findFirst({
    where: { id: tagId, suppression: null },
  })
  return ligne === null ? null : tagToDomain(ligne)
}
