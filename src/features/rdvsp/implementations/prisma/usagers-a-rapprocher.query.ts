import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { LireLesUsagersARapprocher } from '../../domain/ports'
import { usagerExterneToDomain } from './usager-externe.transfer'

export const lireLesUsagersARapprocher: LireLesUsagersARapprocher =
  attraperEnEchecTechnique(async (usagerIds) =>
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
