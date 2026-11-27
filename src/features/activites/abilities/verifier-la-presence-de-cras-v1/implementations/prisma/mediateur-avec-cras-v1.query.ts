import { prismaClient } from '@/configuration/prisma'
import type { MediateurAvecCrasV1 } from '../../domain'

export const mediateurAvecCrasV1: MediateurAvecCrasV1 = async (mediateur) =>
  (await prismaClient.activite.findFirst({
    where: { mediateurId: mediateur, v1CraId: { not: null } },
    select: { id: true },
  })) !== null
