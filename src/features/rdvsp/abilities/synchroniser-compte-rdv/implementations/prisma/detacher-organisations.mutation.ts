import { prismaClient } from '@/configuration/prisma'
import { tenter } from '../../../../implementations/prisma/tenter.adapter'
import type { DetacherOrganisations } from '../../domain/ports'

export const detacherOrganisations: DetacherOrganisations = tenter(
  async ({ compte, organisationIds }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.rdvAccountOrganisation.deleteMany({
        where: {
          accountId: compte.agentId,
          organisationId: { in: [...organisationIds] },
        },
      })

      const { invalidWebhookOrganisationIds } =
        await transaction.rdvAccount.findUniqueOrThrow({
          where: { id: compte.agentId },
          select: { invalidWebhookOrganisationIds: true },
        })

      await transaction.rdvAccount.update({
        where: { id: compte.agentId },
        data: {
          invalidWebhookOrganisationIds: invalidWebhookOrganisationIds.filter(
            (organisationId) =>
              !organisationIds.some((detachee) => detachee === organisationId),
          ),
        },
      })
    })
  },
)
