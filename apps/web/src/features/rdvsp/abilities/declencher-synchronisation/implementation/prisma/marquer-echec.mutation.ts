import { prismaClient } from '@app/web/prismaClient'
import type { MarquerEchecDeSynchronisation } from '../../domain/declencher-synchronisation'

/**
 * `lastSynced` est posé même en échec : la date répond à « quand a-t-on essayé
 * pour la dernière fois », pas à « quand a-t-on réussi ». C'est ce que lit
 * l'administration, à côté du message d'erreur.
 */
export const marquerEchecDeSynchronisation =
  (maintenant: () => Date = () => new Date()): MarquerEchecDeSynchronisation =>
  async ({ compte, message }) => {
    const date = maintenant()

    await prismaClient.rdvAccount.update({
      where: { id: compte.agentId },
      data: { updated: date, lastSynced: date, error: message },
    })
  }
