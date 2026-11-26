import { prismaClient } from '@/configuration/prisma'
import { tenter } from '../../../../implementations/prisma/tenter.adapter'
import type { NoterLesWebhooksInvalides } from '../../domain/ports'

export const noterLesWebhooksInvalides: NoterLesWebhooksInvalides = tenter(
  async ({ agentId, organisationIds }) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: { invalidWebhookOrganisationIds: [...organisationIds] },
    })
  },
)
