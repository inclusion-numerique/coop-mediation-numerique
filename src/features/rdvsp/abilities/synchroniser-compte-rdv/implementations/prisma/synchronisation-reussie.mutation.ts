import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { NoterLaSynchronisationReussie } from '../../domain/ports'

export const noterLaSynchronisationReussie: NoterLaSynchronisationReussie =
  attraperEnEchecTechnique(async ({ agentId, synchroniseeLe }) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: { lastSynced: synchroniseeLe, error: null },
    })
  })
