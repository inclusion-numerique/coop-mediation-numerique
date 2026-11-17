import { prismaClient } from '@app/web/prismaClient'
import { EmailExterne, TelephoneExterne } from '../../../../domain/identite'
import { NomOrganisation } from '../../../../domain/libelle'
import type { Organisation } from '../../../../domain/organisation'
import { OrganisationId } from '../../../../domain/organisation-id'
import type { EtatOrganisations } from '../../domain/synchroniser-organisations'

/**
 * Les organisations connues sont lues sur les seuls identifiants reçus — c'est
 * tout ce qu'il faut pour décider d'une création ou d'une mise à jour. Les
 * rattachements, eux, sont lus **en entier** : c'est en confrontant la totalité
 * des liens du compte à la réponse de l'API qu'on peut voir qu'il en reste un de
 * trop.
 */
export const etatOrganisations: EtatOrganisations = async ({
  compte,
  idsRecus,
}) => {
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
}
