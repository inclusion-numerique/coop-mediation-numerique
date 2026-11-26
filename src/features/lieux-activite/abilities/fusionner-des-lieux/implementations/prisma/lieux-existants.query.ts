import { prismaClient } from '@/configuration/prisma'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { LieuxExistants } from '../../domain'

export const lieuxExistants: LieuxExistants = async (lieux) =>
  (
    await prismaClient.lieuInclusion.findMany({
      where: { id: { in: [...lieux] } },
      select: { id: true },
    })
  ).map(({ id }) => LieuId(id))
