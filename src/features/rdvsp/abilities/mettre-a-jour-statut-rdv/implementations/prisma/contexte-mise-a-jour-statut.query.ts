import { prismaClient } from '@/configuration/prisma'
import { RdvAgentId } from '../../../../domain/identifiants/rdv-agent-id'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { ContexteMiseAJourStatut } from '../../domain/ports'

export const contexteMiseAJourStatut: ContexteMiseAJourStatut = async ({
  utilisateurId,
  rdvId,
}) => {
  const [compteRow, rdvRow] = await Promise.all([
    prismaClient.rdvAccount.findUnique({
      where: { userId: utilisateurId },
      include: { organisations: { select: { organisationId: true } } },
    }),
    prismaClient.rdv.findUnique({
      where: { id: rdvId },
      select: { rdvAccountId: true },
    }),
  ])

  return {
    compte: compteRow === null ? null : compteRdvToDomain(compteRow),
    agentIdDuRdv: rdvRow === null ? null : RdvAgentId(rdvRow.rdvAccountId),
  }
}
