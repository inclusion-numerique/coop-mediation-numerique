import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import {
  lieuFromDomain,
  motifFromDomain,
  usagerFromDomain,
} from '../../../../implementations/prisma/entourage.transfer'
import {
  participationFromDomain,
  rdvFromDomain,
  rdvToDomain,
} from '../../../../implementations/prisma/rdv.transfer'
import type {
  ComptePourWebhook,
  EnregistrerRdvDeLaNotification,
  OrganisationConnue,
  RdvConnuParId,
  SupprimerRdvDeLaNotification,
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

const traceJson = (brut: unknown) => JSON.parse(JSON.stringify(brut ?? {}))

export const enregistrerRdvDeLaNotification: EnregistrerRdvDeLaNotification =
  async ({ rdv, brut }) => {
    await prismaClient.$transaction(async (transaction) => {
      await transaction.rdvUser.createMany({
        data: rdv.participations.map((participation) =>
          usagerFromDomain(participation.usager),
        ),
        skipDuplicates: true,
      })

      if (rdv.lieu !== null) {
        const lieu = lieuFromDomain(rdv.lieu)
        await transaction.rdvLieu.upsert({
          where: { id: rdv.lieu.id },
          create: lieu,
          update: lieu,
        })
      }

      if (rdv.motif !== null) {
        const motif = motifFromDomain(rdv.motif)
        await transaction.rdvMotif.upsert({
          where: { id: rdv.motif.id },
          create: motif,
          update: motif,
        })
      }

      const colonnes = { ...rdvFromDomain(rdv), rawData: traceJson(brut) }

      await transaction.rdv.upsert({
        where: { id: rdv.id },
        create: colonnes,
        update: colonnes,
      })

      await transaction.rdvParticipation.deleteMany({
        where: { rdvId: rdv.id },
      })

      await transaction.rdvParticipation.createMany({
        data: rdv.participations.map((participation) => ({
          ...participationFromDomain(participation),
          rdvId: rdv.id,
        })),
      })
    })
  }

export const supprimerRdvDeLaNotification: SupprimerRdvDeLaNotification =
  async (rdvId) => {
    await prismaClient.rdv.deleteMany({ where: { id: rdvId } })
  }
