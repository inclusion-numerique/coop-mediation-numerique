import { prismaClient } from '@/configuration/prisma/prisma-client'

export const noterLaSynchronisationReussie = async ({
  agentId,
  organisationIdsSansWebhook,
}: {
  agentId: number
  organisationIdsSansWebhook: readonly number[] | undefined
}): Promise<void> => {
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
}
