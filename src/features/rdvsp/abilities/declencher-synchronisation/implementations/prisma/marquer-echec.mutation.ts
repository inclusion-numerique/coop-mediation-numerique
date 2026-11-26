import { prismaClient } from '@/configuration/prisma'
import type { MarquerEchecDeSynchronisation } from '../../domain/ports'

/**
 * `lastSynced` est posé même en échec : la date répond à « quand a-t-on essayé
 * pour la dernière fois », pas à « quand a-t-on réussi ». C'est ce que lit
 * l'administration, à côté du message d'erreur.
 */
export const marquerEchecDeSynchronisation: MarquerEchecDeSynchronisation =
  async ({ agentId, message, le }) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: { updated: le, lastSynced: le, error: message },
    })
  }
