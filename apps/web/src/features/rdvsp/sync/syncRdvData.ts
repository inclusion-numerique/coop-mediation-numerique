import { prismaClient } from '@app/web/prismaClient'
import {
  executeOAuthRdvApiCall,
  type OauthRdvApiResponseResult,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import type {
  OAuthApiParticipation,
  OAuthApiRdv,
  OAuthApiRdvsResponse,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import type { Prisma, RdvAccount } from '@prisma/client'

const formatIsoDay = (value: Date) => value.toISOString().split('T')[0]

const parseDate = (value: string | null): Date | null =>
  value ? new Date(value) : null

const optional = (value: string | null | undefined) => value ?? null

const isSuccessResponse = <T>(
  result: OauthRdvApiResponseResult<T>,
): result is { status: 'ok'; data: T; error: undefined } =>
  result.status === 'ok'

const fetchAllAgentRdvs = async ({
  rdvAccount,
  startsAfter,
}: {
  rdvAccount: RdvAccount
  startsAfter?: string
}) => {
  const rdvs: OAuthApiRdv[] = []
  let page = 1

  while (page) {
    const response = await executeOAuthRdvApiCall<OAuthApiRdvsResponse>({
      rdvAccount,
      path: '/rdvs',
      config: {
        method: 'GET',
        params: {
          page,
          agent_id: rdvAccount.id,
          starts_after: startsAfter,
        },
      },
    })

    if (!isSuccessResponse(response)) {
      throw new Error(`RDV API error: ${response.error}`)
    }

    rdvs.push(...response.data.rdvs)

    const nextPage = response.data.meta.next_page
    if (typeof nextPage === 'number') {
      page = nextPage
    } else if (typeof nextPage === 'string') {
      const parsed = Number(nextPage)
      page = Number.isFinite(parsed) ? parsed : 0
    } else {
      page = 0
    }
  }

  return rdvs
}

const syncRdvUser = async ({
  tx,
  mediateurId,
  user,
}: {
  tx: Prisma.TransactionClient
  mediateurId: string
  user: OAuthApiParticipation['user']
}) => {
  await tx.rdvUser.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      address: optional(user.address),
      addressDetails: optional(user.address_details),
      affiliationNumber: optional(user.affiliation_number),
      birthDate: parseDate(user.birth_date),
      birthName: optional(user.birth_name),
      caisseAffiliation: optional(user.caisse_affiliation),
      createdAt: parseDate(user.created_at),
      email: optional(user.email),
      firstName: user.first_name,
      invitationAcceptedAt: parseDate(user.invitation_accepted_at),
      invitationCreatedAt: parseDate(user.invitation_created_at),
      lastName: user.last_name,
      notifyByEmail: user.notify_by_email,
      notifyBySms: user.notify_by_sms,
      phoneNumber: optional(user.phone_number),
      phoneNumberFormatted: optional(user.phone_number_formatted),
      responsibleId: user.responsible_id ?? null,
    },
    update: {
      address: optional(user.address),
      addressDetails: optional(user.address_details),
      affiliationNumber: optional(user.affiliation_number),
      birthDate: parseDate(user.birth_date),
      birthName: optional(user.birth_name),
      caisseAffiliation: optional(user.caisse_affiliation),
      createdAt: parseDate(user.created_at),
      email: optional(user.email),
      firstName: user.first_name,
      invitationAcceptedAt: parseDate(user.invitation_accepted_at),
      invitationCreatedAt: parseDate(user.invitation_created_at),
      lastName: user.last_name,
      notifyByEmail: user.notify_by_email,
      notifyBySms: user.notify_by_sms,
      phoneNumber: optional(user.phone_number),
      phoneNumberFormatted: optional(user.phone_number_formatted),
      responsibleId: user.responsible_id ?? null,
    },
  })

  const beneficiaire = await tx.beneficiaire.findFirst({
    where: {
      mediateurId,
      OR: [{ rdvUserId: user.id }, { rdvServicePublicId: user.id }],
    },
  })

  if (beneficiaire) {
    const updateData: Prisma.BeneficiaireUpdateInput = {
      rdvServicePublicId: user.id,
      rdvUser: { connect: { id: user.id } },
      modification: new Date(),
    }

    if (!beneficiaire.prenom && user.first_name) {
      updateData.prenom = user.first_name
    }

    if (!beneficiaire.nom && user.last_name) {
      updateData.nom = user.last_name
    }

    if (!beneficiaire.email && user.email) {
      updateData.email = user.email
    }

    if (!beneficiaire.telephone && user.phone_number) {
      updateData.telephone = user.phone_number
    }

    await tx.beneficiaire.update({
      where: { id: beneficiaire.id },
      data: updateData,
    })
    return
  }

  await tx.beneficiaire.create({
    data: {
      mediateur: { connect: { id: mediateurId } },
      rdvServicePublicId: user.id,
      rdvUser: { connect: { id: user.id } },
      anonyme: false,
      prenom: optional(user.first_name),
      nom: optional(user.last_name),
      email: optional(user.email),
      telephone: optional(user.phone_number),
    },
  })
}

const syncAgent = async ({
  tx,
  agent,
}: {
  tx: Prisma.TransactionClient
  agent: OAuthApiRdv['agents'][number]
}) =>
  tx.rdvAgent.upsert({
    where: { id: agent.id },
    create: {
      id: agent.id,
      email: agent.email,
      firstName: optional(agent.first_name),
      lastName: optional(agent.last_name),
    },
    update: {
      email: agent.email,
      firstName: optional(agent.first_name),
      lastName: optional(agent.last_name),
    },
  })

const syncOrganisationGraph = async ({
  tx,
  rdv,
  rdvAccountId,
}: {
  tx: Prisma.TransactionClient
  rdv: OAuthApiRdv
  rdvAccountId: number
}) => {
  await tx.rdvOrganisation.upsert({
    where: { id: rdv.organisation.id },
    create: {
      id: rdv.organisation.id,
      accountId: rdvAccountId,
      name: rdv.organisation.name,
      email: optional(rdv.organisation.email),
      phoneNumber: optional(rdv.organisation.phone_number),
      verticale: optional(rdv.organisation.verticale),
    },
    update: {
      accountId: rdvAccountId,
      name: rdv.organisation.name,
      email: optional(rdv.organisation.email),
      phoneNumber: optional(rdv.organisation.phone_number),
      verticale: optional(rdv.organisation.verticale),
    },
  })

  const motifCategory = rdv.motif?.motif_category

  if (motifCategory) {
    await tx.rdvMotifCategory.upsert({
      where: { id: motifCategory.id },
      create: {
        id: motifCategory.id,
        name: motifCategory.name,
        shortName: motifCategory.short_name,
      },
      update: {
        name: motifCategory.name,
        shortName: motifCategory.short_name,
      },
    })
  }

  if (rdv.motif) {
    await tx.rdvMotif.upsert({
      where: { id: rdv.motif.id },
      create: {
        id: rdv.motif.id,
        deletedAt: parseDate(rdv.motif.deleted_at),
        locationType: rdv.motif.location_type,
        name: rdv.motif.name,
        organisationId: rdv.motif.organisation_id,
        motifCategoryId: motifCategory?.id ?? null,
        bookablePublicly: rdv.motif.bookable_publicly,
        bookableBy: rdv.motif.bookable_by,
        serviceId: rdv.motif.service_id ?? null,
        collectif: rdv.motif.collectif ?? null,
        followUp: rdv.motif.follow_up ?? null,
        instructionForRdv: optional(rdv.motif.instruction_for_rdv),
      },
      update: {
        deletedAt: parseDate(rdv.motif.deleted_at),
        locationType: rdv.motif.location_type,
        name: rdv.motif.name,
        organisationId: rdv.motif.organisation_id,
        motifCategoryId: motifCategory?.id ?? null,
        bookablePublicly: rdv.motif.bookable_publicly,
        bookableBy: rdv.motif.bookable_by,
        serviceId: rdv.motif.service_id ?? null,
        collectif: rdv.motif.collectif ?? null,
        followUp: rdv.motif.follow_up ?? null,
        instructionForRdv: optional(rdv.motif.instruction_for_rdv),
      },
    })
  }

  if (rdv.lieu) {
    await tx.rdvLieu.upsert({
      where: { id: rdv.lieu.id },
      create: {
        id: rdv.lieu.id,
        address: rdv.lieu.address,
        name: rdv.lieu.name,
        organisationId: rdv.lieu.organisation_id,
        phoneNumber: optional(rdv.lieu.phone_number),
        singleUse: rdv.lieu.single_use,
      },
      update: {
        address: rdv.lieu.address,
        name: rdv.lieu.name,
        organisationId: rdv.lieu.organisation_id,
        phoneNumber: optional(rdv.lieu.phone_number),
        singleUse: rdv.lieu.single_use,
      },
    })
  }
}

const syncRdvAggregate = async ({
  tx,
  rdv,
}: {
  tx: Prisma.TransactionClient
  rdv: OAuthApiRdv
}) => {
  await tx.rdv.upsert({
    where: { id: rdv.id },
    create: {
      id: rdv.id,
      address: rdv.address,
      cancelledAt: parseDate(rdv.cancelled_at),
      collectif: rdv.collectif,
      context: optional(rdv.context),
      createdAt: parseDate(rdv.created_at),
      createdBy: rdv.created_by,
      createdByType: rdv.created_by_type,
      createdById: rdv.created_by_id,
      durationInMin: rdv.duration_in_min,
      endsAt: new Date(rdv.ends_at),
      maxParticipantsCount: rdv.max_participants_count ?? null,
      name: optional(rdv.name),
      organisationId: rdv.organisation.id,
      motifId: rdv.motif?.id ?? null,
      lieuId: rdv.lieu?.id ?? null,
      startsAt: new Date(rdv.starts_at),
      status: rdv.status,
      usersCount: rdv.users_count,
      uuid: rdv.uuid,
    },
    update: {
      address: rdv.address,
      cancelledAt: parseDate(rdv.cancelled_at),
      collectif: rdv.collectif,
      context: optional(rdv.context),
      createdAt: parseDate(rdv.created_at),
      createdBy: rdv.created_by,
      createdByType: rdv.created_by_type,
      createdById: rdv.created_by_id,
      durationInMin: rdv.duration_in_min,
      endsAt: new Date(rdv.ends_at),
      maxParticipantsCount: rdv.max_participants_count ?? null,
      name: optional(rdv.name),
      organisationId: rdv.organisation.id,
      motifId: rdv.motif?.id ?? null,
      lieuId: rdv.lieu?.id ?? null,
      startsAt: new Date(rdv.starts_at),
      status: rdv.status,
      usersCount: rdv.users_count,
      uuid: rdv.uuid,
    },
  })

  await tx.rdvAgentAssignment.deleteMany({ where: { rdvId: rdv.id } })

  if (rdv.agents.length > 0) {
    await tx.rdvAgentAssignment.createMany({
      data: rdv.agents.map((agent) => ({
        rdvId: rdv.id,
        agentId: agent.id,
      })),
    })
  }

  await tx.rdvParticipation.deleteMany({ where: { rdvId: rdv.id } })

  if (rdv.participations.length > 0) {
    await tx.rdvParticipation.createMany({
      data: rdv.participations.map((participation) => ({
        id: participation.id,
        rdvId: rdv.id,
        userId: participation.user.id,
        agentId: null,
        status: participation.status,
        sendLifecycleNotifications: participation.send_lifecycle_notifications,
        sendReminderNotification: participation.send_reminder_notification,
        createdBy: participation.created_by,
        createdByType: participation.created_by_type,
        createdById: participation.created_by_id ?? null,
        createdByAgentPrescripteur:
          participation.created_by_agent_prescripteur ?? null,
      })),
    })
  }

  await tx.activite.updateMany({
    where: { rdvServicePublicId: rdv.id },
    data: { rdvId: rdv.id },
  })
}

export const syncRdvData = async ({
  rdvAccount,
  mediateurId,
}: {
  rdvAccount: RdvAccount
  mediateurId: string
}) => {
  if (!rdvAccount.accessToken || !rdvAccount.refreshToken) {
    return
  }

  const startsAfter = rdvAccount.syncFrom
    ? formatIsoDay(rdvAccount.syncFrom)
    : undefined

  const rdvs = await fetchAllAgentRdvs({ rdvAccount, startsAfter })

  const rdvUsers = new Map<number, OAuthApiParticipation['user']>()
  const rdvAgents = new Map<number, OAuthApiRdv['agents'][number]>()

  for (const rdv of rdvs) {
    for (const participation of rdv.participations) {
      rdvUsers.set(participation.user.id, participation.user)
    }

    for (const agent of rdv.agents) {
      rdvAgents.set(agent.id, agent)
    }
  }

  await prismaClient.$transaction(async (tx) => {
    for (const user of rdvUsers.values()) {
      await syncRdvUser({ tx, mediateurId, user })
    }

    for (const agent of rdvAgents.values()) {
      await syncAgent({ tx, agent })
    }

    for (const rdv of rdvs) {
      await syncOrganisationGraph({
        tx,
        rdv,
        rdvAccountId: rdvAccount.id,
      })
      await syncRdvAggregate({ tx, rdv })
    }
  })

  await prismaClient.rdvAccount.update({
    where: { id: rdvAccount.id },
    data: { lastSynced: new Date(), error: null },
  })
}
