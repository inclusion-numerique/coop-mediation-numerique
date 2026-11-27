import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { NoterLesWebhooksInvalides } from '../../domain/ports'

export const noterLesWebhooksInvalides: NoterLesWebhooksInvalides =
  attraperEnEchecTechnique(async ({ agentId, organisationIds }) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: { invalidWebhookOrganisationIds: [...organisationIds] },
    })
  })
