import { prismaClient } from '@app/web/prismaClient'
import {
  lieuFromDomain,
  motifFromDomain,
  participationFromDomain,
  rdvFromDomain,
  rdvToDomain,
  usagerFromDomain,
} from '../../../../db'
import type {
  ComptePourWebhook,
  EnregistrerRdvDeLaNotification,
  RdvConnuParId,
  SupprimerRdvDeLaNotification,
} from '../../domain/recevoir-webhook-rdv'

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
        mediateurId: row.user?.mediateur?.id ?? null,
      }
}

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
    : { rdv: rdvToDomain(row), craRefuse: row.craDeclined }
}

const traceJson = (brut: unknown) => JSON.parse(JSON.stringify(brut ?? {}))

/**
 * Le rendez-vous et son entourage sont écrits d'un seul tenant, dans l'ordre des
 * clés étrangères. Les participations sont remplacées : RDV Service Public fait
 * autorité sur la liste des participants.
 *
 * `craDeclined` n'est pas touché — la colonne appartient au médiateur, pas au
 * service. C'est ce qui permet à `decisionPourWebhookRdv` de la protéger en
 * amont sans que l'écriture la contredise.
 */
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
