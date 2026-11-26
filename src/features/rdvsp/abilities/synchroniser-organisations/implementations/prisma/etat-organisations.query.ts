import { prismaClient } from '@/configuration/prisma'
import { OrganisationId } from '../../../../domain/identifiants/organisation-id'
import { EmailExterne, TelephoneExterne } from '../../../../domain/identite'
import { NomOrganisation } from '../../../../domain/libelle'
import type { Organisation } from '../../../../domain/organisation'
import { tenter } from '../../../../implementations/prisma/tenter.adapter'
import type { EtatOrganisations } from '../../domain/ports'

export const etatOrganisations: EtatOrganisations = tenter(
  async ({ compte, idsRecus }) => {
    const [connues, rattachements] = await Promise.all([
      prismaClient.rdvOrganisation.findMany({
        where: { id: { in: [...idsRecus] } },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          verticale: true,
        },
      }),
      prismaClient.rdvAccountOrganisation.findMany({
        where: { accountId: compte.agentId },
        select: { organisationId: true },
      }),
    ])

    return {
      connues: connues.map(
        (row): Organisation => ({
          id: OrganisationId(row.id),
          nom: NomOrganisation(row.name),
          email: row.email === null ? null : EmailExterne.safe(row.email),
          telephone:
            row.phoneNumber === null
              ? null
              : TelephoneExterne.safe(row.phoneNumber),
          verticale: row.verticale,
        }),
      ),
      rattachements: rattachements.map(({ organisationId }) =>
        OrganisationId(organisationId),
      ),
    }
  },
)
