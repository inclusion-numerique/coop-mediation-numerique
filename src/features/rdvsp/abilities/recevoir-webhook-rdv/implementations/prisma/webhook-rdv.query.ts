import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { rdvToDomain } from '../../../../implementations/prisma/rdv.transfer'
import type {
  ComptePourWebhook,
  OrganisationConnue,
  RdvConnuParId,
} from '../../domain/ports'

export const comptePourWebhook: ComptePourWebhook = async (agentId) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { id: agentId },
    select: {
      syncFrom: true,
      user: { select: { mediateur: { select: { id: true } } } },
    },
  })

  return row === null
    ? null
    : {
        synchroniserDepuis: row.syncFrom,
        mediateurId:
          row.user?.mediateur == null
            ? null
            : MediateurId(row.user.mediateur.id),
      }
}

export const organisationConnue: OrganisationConnue = async (organisationId) =>
  (await prismaClient.rdvOrganisation.count({
    where: { id: organisationId },
  })) > 0

export const rdvConnuParId: RdvConnuParId = async (rdvId) => {
  const row = await prismaClient.rdv.findUnique({
    where: { id: rdvId },
    include: {
      motif: true,
      lieu: true,
      participations: { include: { user: true } },
    },
  })

  return row === null
    ? null
    : { rdv: rdvToDomain(row), compteRenduRegle: row.compteRenduRegle }
}
