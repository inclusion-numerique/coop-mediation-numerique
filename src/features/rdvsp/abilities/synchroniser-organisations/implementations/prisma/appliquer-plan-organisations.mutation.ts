import { prismaClient } from '@/configuration/prisma'
import type { Organisation } from '../../../../domain/organisation'
import { tenter } from '../../../../implementations/prisma/tenter.adapter'
import type { AppliquerPlanOrganisations } from '../../domain/ports'

const colonnes = (organisation: Organisation) => ({
  id: organisation.id,
  name: organisation.nom,
  email: organisation.email,
  phoneNumber: organisation.telephone,
  verticale: organisation.verticale,
})

export const appliquerPlanOrganisations: AppliquerPlanOrganisations = tenter(
  async ({ compte, plan }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.rdvOrganisation.createMany({
        data: plan.aCreer.map(colonnes),
        skipDuplicates: true,
      })

      await Promise.all(
        plan.aMettreAJour.map((organisation) =>
          transaction.rdvOrganisation.update({
            where: { id: organisation.id },
            data: colonnes(organisation),
          }),
        ),
      )

      await transaction.rdvAccountOrganisation.deleteMany({
        where: {
          accountId: compte.agentId,
          organisationId: { in: [...plan.aDetacher] },
        },
      })

      await transaction.rdvAccountOrganisation.createMany({
        data: plan.aRattacher.map((organisationId) => ({
          accountId: compte.agentId,
          organisationId,
        })),
        skipDuplicates: true,
      })
    })
  },
)
