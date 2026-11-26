import { prismaClient } from '@/configuration/prisma'
import { tenter } from '../../../../implementations/prisma/tenter.adapter'
import type { NoterLaSynchronisationReussie } from '../../domain/ports'

export const noterLaSynchronisationReussie: NoterLaSynchronisationReussie =
  tenter(async ({ agentId, organisationIdsSansWebhook }) => {
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
