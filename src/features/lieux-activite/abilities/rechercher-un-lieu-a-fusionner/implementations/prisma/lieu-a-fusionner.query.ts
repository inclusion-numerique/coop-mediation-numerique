import { prismaClient } from '@/configuration/prisma'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'

export const lieuAFusionner = (lieuId: LieuId) =>
  prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { nom: true },
  })
