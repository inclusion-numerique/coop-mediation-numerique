import { prismaClient } from '@/configuration/prisma'
import type { EffacerUnTag } from '../../domain/supprimer-un-tag'

export const effacerUnTag: EffacerUnTag = async (tagId) => {
  await prismaClient.$transaction([
    prismaClient.activitesTags.deleteMany({ where: { tagId } }),
    prismaClient.activitesCoordinationTags.deleteMany({ where: { tagId } }),
    prismaClient.tag.delete({ where: { id: tagId } }),
  ])
}
