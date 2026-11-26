import { prismaClient } from '@/configuration/prisma'
import type { MarquerEchecDeSynchronisation } from '../../domain/ports'

export const marquerEchecDeSynchronisation: MarquerEchecDeSynchronisation =
  async ({ agentId, message, le }) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: { updated: le, lastSynced: le, error: message },
    })
  }
