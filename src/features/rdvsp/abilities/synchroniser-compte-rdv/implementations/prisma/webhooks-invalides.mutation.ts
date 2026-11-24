import { prismaClient } from '@/configuration/prisma/prismaClient'

export const noterLesWebhooksInvalides = async ({
  agentId,
  organisationIds,
}: {
  agentId: number
  organisationIds: number[]
}): Promise<void> => {
  await prismaClient.rdvAccount.update({
    where: { id: agentId },
    data: { invalidWebhookOrganisationIds: organisationIds },
  })
}
