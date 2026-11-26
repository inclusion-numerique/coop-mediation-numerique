import { prismaClient } from '@/configuration/prisma'
import type { LireLesUsagersARapprocher } from '../../domain/ports'
import { tenter } from './tenter.adapter'
import { usagerExterneToDomain } from './usager-externe.transfer'

export const lireLesUsagersARapprocher: LireLesUsagersARapprocher = tenter(
  async (usagerIds) =>
    (
      await prismaClient.rdvUser.findMany({
        where: { id: { in: [...usagerIds] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          address: true,
          birthDate: true,
        },
      })
    ).map(usagerExterneToDomain),
)
