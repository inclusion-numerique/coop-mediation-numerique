import { prismaClient } from '@app/web/prismaClient'
import type {
  OAuthApiParticipation,
  OAuthApiRdv,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import type { Prisma } from '@prisma/client'

// Helper to convert API lieu to Prisma data (exported for use in importRdvs.ts)
export const lieuPrismaDataFromOAuthApiLieu = (
  lieu: Exclude<OAuthApiRdv['lieu'], null>,
) => {
  return {
    id: lieu.id,
    name: lieu.name,
    address: lieu.address,
    phoneNumber: lieu.phone_number,
    singleUse: lieu.single_use,
    organisationId: lieu.organisation_id,
  } satisfies Prisma.RdvLieuUncheckedCreateInput
}

// Helper to convert API motif to Prisma data (exported for use in importRdvs.ts)
export const motifPrismaDataFromOAuthApiMotif = (
  motif: OAuthApiRdv['motif'],
) => {
  return {
    id: motif.id,
    collectif: motif.collectif,
    name: motif.name,
    organisationId: motif.organisation_id,
    followUp: motif.follow_up,
    instructionForRdv: motif.instruction_for_rdv,
    locationType: motif.location_type,
    motifCategoryId: motif.motif_category?.id,
  } satisfies Prisma.RdvMotifUncheckedCreateInput
}

// Helper to convert API user to Prisma data (exported for use in importRdvs.ts)
// Note: responsibleId is intentionally not stored to avoid FK constraint issues
// (it's a self-referential FK and the responsible user may not exist in our DB)
export const userPrismaDataFromOAuthApiUser = (
  user: OAuthApiRdv['participations'][number]['user'],
) => {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    notifyByEmail: user.notify_by_email,
    notifyBySms: user.notify_by_sms,
    phoneNumber: user.phone_number,
    phoneNumberFormatted: user.phone_number_formatted,
    address: user.address,
    addressDetails: user.address_details,
    affiliationNumber: user.affiliation_number,
    birthDate: user.birth_date ? new Date(user.birth_date) : null,
    birthName: user.birth_name,
    caisseAffiliation: user.caisse_affiliation,
    createdAt: new Date(user.created_at),
    invitationAcceptedAt: user.invitation_accepted_at
      ? new Date(user.invitation_accepted_at)
      : null,
    invitationCreatedAt: user.invitation_created_at
      ? new Date(user.invitation_created_at)
      : null,
    // responsibleId intentionally not stored (self-referential FK constraint issues)
    syncedAt: new Date(),
  } satisfies Omit<Prisma.RdvUserUncheckedCreateInput, 'responsibleId'>
}

// Helper to convert API rdv to Prisma data
const rdvPrismaDataFromOAuthApiRdv = (
  rdv: OAuthApiRdv,
  rdvAccountId: number,
) => {
  return {
    id: rdv.id,
    uuid: rdv.uuid,
    rdvAccountId,
    status: rdv.status,
    durationInMin: rdv.duration_in_min,
    address: rdv.address,
    startsAt: new Date(rdv.starts_at),
    endsAt: new Date(rdv.ends_at),
    usersCount: rdv.users_count,
    maxParticipantsCount: rdv.max_participants_count,
    name: rdv.name,
    motifId: rdv.motif.id,
    collectif: rdv.collectif,
    context: rdv.context,
    createdById: rdv.created_by_id,
    lieuId: rdv.lieu?.id,
    organisationId: rdv.organisation.id,
    urlForAgents: rdv.url_for_agents,
    rawData: rdv,
  } satisfies Prisma.RdvUncheckedCreateInput
}

// Helper to convert API participation to Prisma data
const rdvParticipationPrismaDataFromOAuthApiParticipation = (
  participation: OAuthApiParticipation,
  rdvId: number,
) => {
  return {
    id: participation.id,
    rdvId,
    userId: participation.user.id,
    status: participation.status,
    sendLifecycleNotifications: participation.send_lifecycle_notifications,
    sendReminderNotification: participation.send_reminder_notification,
  } satisfies Prisma.RdvParticipationUncheckedCreateInput
}

// Sync user (create or update)
export const syncRdvUser = async (
  user: OAuthApiRdv['participations'][number]['user'],
) => {
  const data = userPrismaDataFromOAuthApiUser(user)
  const upserted = await prismaClient.rdvUser.upsert({
    where: { id: user.id },
    update: data,
    create: data,
    include: {
      beneficiaires: true,
    },
  })

  return upserted
}

// Sync lieu (create or update)
export const syncRdvLieu = async (lieu: Exclude<OAuthApiRdv['lieu'], null>) => {
  const data = lieuPrismaDataFromOAuthApiLieu(lieu)
  await prismaClient.rdvLieu.upsert({
    where: { id: lieu.id },
    update: data,
    create: data,
  })
}

// Sync motif (create or update)
export const syncRdvMotif = async (motif: OAuthApiRdv['motif']) => {
  const data = motifPrismaDataFromOAuthApiMotif(motif)
  await prismaClient.rdvMotif.upsert({
    where: { id: motif.id },
    update: data,
    create: data,
  })
}

// Create RDV with participations
export const createRdv = async (rdv: OAuthApiRdv, rdvAccountId: number) => {
  await prismaClient.$transaction(async (tx) => {
    await tx.rdv.create({
      data: rdvPrismaDataFromOAuthApiRdv(rdv, rdvAccountId),
    })
    await tx.rdvParticipation.createMany({
      data: rdv.participations.map((participation) =>
        rdvParticipationPrismaDataFromOAuthApiParticipation(
          participation,
          rdv.id,
        ),
      ),
    })
  })
}

// Update RDV with participations
export const updateRdv = async (rdv: OAuthApiRdv, rdvAccountId: number) => {
  await prismaClient.$transaction(async (tx) => {
    // Delete existing participations
    await tx.rdvParticipation.deleteMany({
      where: {
        rdvId: rdv.id,
      },
    })
    // Update RDV
    await tx.rdv.update({
      where: {
        id: rdv.id,
      },
      data: rdvPrismaDataFromOAuthApiRdv(rdv, rdvAccountId),
    })
    // Recreate participations
    await tx.rdvParticipation.createMany({
      data: rdv.participations.map((participation) =>
        rdvParticipationPrismaDataFromOAuthApiParticipation(
          participation,
          rdv.id,
        ),
      ),
    })
  })
}

// Delete RDV (cascade will delete participations)
export const deleteRdv = async (rdvId: number) => {
  await prismaClient.rdv.delete({
    where: { id: rdvId },
  })
}

// Delete multiple RDVs
export const deleteRdvs = async (rdvIds: number[]) => {
  await prismaClient.rdv.deleteMany({
    where: { id: { in: rdvIds } },
  })
}

// Sync RDV dependencies (users, lieu, motif) before syncing the RDV itself
export const syncRdvDependencies = async (rdv: OAuthApiRdv) => {
  // Sync all users from participations
  const rdvUsers = await Promise.all(
    rdv.participations.map((participation) => syncRdvUser(participation.user)),
  )

  // Sync lieu if present
  if (rdv.lieu) {
    await syncRdvLieu(rdv.lieu)
  }

  // Sync motif
  if (rdv.motif) {
    await syncRdvMotif(rdv.motif)
  }

  return { rdvUsers }
}
