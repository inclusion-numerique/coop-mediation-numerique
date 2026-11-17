import { prismaClient } from '@app/web/prismaClient'
import type { Organisation } from '../../../../domain/organisation'
import type { AppliquerPlanOrganisations } from '../../domain/synchroniser-organisations'

const colonnes = (organisation: Organisation) => ({
  id: organisation.id,
  name: organisation.nom,
  email: organisation.email,
  phoneNumber: organisation.telephone,
  verticale: organisation.verticale,
})

/**
 * Applique le plan d'un seul tenant : les organisations doivent exister avant
 * qu'on y rattache le compte, et un plan à moitié appliqué laisserait des liens
 * pointant vers des organisations absentes.
 */
export const appliquerPlanOrganisations: AppliquerPlanOrganisations = async ({
  compte,
  plan,
}) => {
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
}
