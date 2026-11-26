import { prismaClient } from '@/configuration/prisma'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { CompteRdvExistant } from '../../domain/ports'

export const compteRdvExistant: CompteRdvExistant = async ({
  agentId,
  utilisateurId,
}) => {
  const row = await prismaClient.rdvAccount.findFirst({
    where: { OR: [{ id: agentId }, { userId: utilisateurId }] },
    include: { organisations: { select: { organisationId: true } } },
  })

  return row === null ? null : compteRdvToDomain(row)
}
