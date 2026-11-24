import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { CompteRdv } from '../../../../domain/compte/compte-rdv'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'

export const compteASynchroniser = async (
  compteId: number,
): Promise<CompteRdv> =>
  compteRdvToDomain(
    await prismaClient.rdvAccount.findUniqueOrThrow({
      where: { id: compteId },
      include: { organisations: { select: { organisationId: true } } },
    }),
  )
