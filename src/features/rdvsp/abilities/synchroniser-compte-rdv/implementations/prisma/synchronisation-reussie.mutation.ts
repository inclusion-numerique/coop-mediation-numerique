import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { NoterLaSynchronisationReussie } from '../../domain/ports'

export const noterLaSynchronisationReussie: NoterLaSynchronisationReussie =
  attraperEnEchecTechnique(async ({ agentId, organisationIdsSansWebhook }) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: {
        lastSynced: new Date(),
        error: null,
        ...(organisationIdsSansWebhook === undefined
          ? {}
          : { invalidWebhookOrganisationIds: [...organisationIdsSansWebhook] }),
      },
    })
  })
