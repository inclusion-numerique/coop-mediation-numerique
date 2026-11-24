import { prismaClient } from '@/configuration/prisma/prismaClient'
import type { JetonsOAuth } from '../../domain/compte/jetons-oauth'
import type { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'
import { jetonsCompteToDomain } from './compte-rdv.transfer'

export const jetonsCourants = async (
  agentId: RdvAgentId,
): Promise<JetonsOAuth | null> => {
  const compte = await prismaClient.rdvAccount.findUnique({
    where: { id: agentId },
    select: {
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
      scope: true,
    },
  })

  return compte === null ? null : jetonsCompteToDomain(compte)
}
