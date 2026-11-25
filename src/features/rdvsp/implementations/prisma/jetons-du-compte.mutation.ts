import { prismaClient } from '@/configuration/prisma'
import type { JetonsOAuth } from '../../domain/compte/jetons-oauth'
import type { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'

export const enregistrerLesJetons = async (
  agentId: RdvAgentId,
  jetons: JetonsOAuth,
): Promise<void> => {
  await prismaClient.rdvAccount.update({
    where: { id: agentId },
    data: {
      accessToken: jetons.acces,
      refreshToken: jetons.rafraichissement,
      expiresAt: jetons.expiration,
      scope: jetons.portee,
    },
  })
}
