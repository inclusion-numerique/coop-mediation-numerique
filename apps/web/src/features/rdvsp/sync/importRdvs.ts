import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentialsWithId,
  oAuthRdvApiListRdvs,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import type {
  OAuthApiParticipation,
  OAuthApiRdv,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import { UserId, UserWithExistingRdvAccount } from '@app/web/utils/user'
import type { Prisma } from '@prisma/client'
import { chunk } from 'lodash-es'
import { AppendLog } from './syncAllRdvData'

const getImportedRdvIds = async ({
  rdvAccountId,
}: {
  rdvAccountId: number
}) => {
  return await prismaClient.rdv
    .findMany({
      where: {
        rdvAccountId,
      },
      select: {
        id: true,
      },
    })
    .then((rdvs) => rdvs.map((rdv) => rdv.id))
}

const findExistingRdvs = async ({ rdvIds }: { rdvIds: number[] }) => {
  return await prismaClient.rdv.findMany({
    where: {
      id: { in: rdvIds },
    },
    include: {
      organisation: true,
      lieu: true,
      participations: {
        include: {
          user: true,
        },
      },
    },
  })
}
type ExistingRdv = Awaited<ReturnType<typeof findExistingRdvs>>[number]

const normalizeExistingRdvData = (existingRdvs: ExistingRdv[]) => {
  const existingRdvsMap = new Map(existingRdvs.map((rdv) => [rdv.id, rdv]))
  const existingParticipations = existingRdvs.flatMap(
    (rdv) => rdv.participations,
  )
  const existingParticipationsMap = new Map(
    existingParticipations.map((participation) => [
      participation.id,
      participation,
    ]),
  )

  const existingUsers = existingParticipations.flatMap(
    (participation) => participation.user,
  )
  const existingUsersMap = new Map(existingUsers.map((user) => [user.id, user]))
  const existingLieux = existingRdvs
    .map((rdv) => rdv.lieu)
    .filter(isDefinedAndNotNull)
  const existingLieuxMap = new Map(existingLieux.map((lieu) => [lieu.id, lieu]))
  return {
    existingRdvsMap,
    existingParticipationsMap,
    existingUsersMap,
    existingLieuxMap,
  }
}

const participationHasDiff = (
  existing: ExistingRdv['participations'][number],
  participation: OAuthApiParticipation,
) => {
  return (
    existing.status !== participation.status ||
    existing.userId !== participation.user.id
  )
}

const userHasDiff = (
  existing: ExistingRdv['participations'][number]['user'],
  user: OAuthApiRdv['participations'][number]['user'],
) => {
  return (
    existing.firstName !== user.first_name ||
    existing.lastName !== user.last_name ||
    existing.email !== user.email
  )
}

const lieuHasDiff = (
  existing: ExistingRdv['lieu'],
  lieu: OAuthApiRdv['lieu'],
) => {
  return (
    existing?.name !== lieu?.name ||
    existing?.address !== lieu?.address ||
    existing?.phoneNumber !== lieu?.phone_number
  )
}

const lieuPrismaDataFromOAuthApiLieu = (
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

const importLieux = async ({
  existingLieuxMap,
  chunkRdvs,
  appendLog,
  skipExistingLieuIds,
}: {
  existingLieuxMap: Map<number, ExistingRdv['lieu']>
  chunkRdvs: OAuthApiRdv[]
  appendLog: AppendLog
  skipExistingLieuIds: Set<number>
}) => {
  const lieuxWithDuplicates = chunkRdvs
    .map((rdv) => rdv.lieu)
    .filter(isDefinedAndNotNull)
  const lieux = [
    ...new Map(lieuxWithDuplicates.map((lieu) => [lieu.id, lieu])).values(),
  ].filter((lieu) => !skipExistingLieuIds.has(lieu.id))
  appendLog(`importing ${lieux.length} lieux`)
  let noop = 0
  let updated = 0
  let created = 0

  for (const lieu of lieux) {
    const existingLieu = existingLieuxMap.get(lieu.id)
    if (existingLieu) {
      // no-op if no diff
      if (!lieuHasDiff(existingLieu, lieu)) {
        noop++
        continue
      }

      // update if existing
      await prismaClient.rdvLieu.update({
        where: { id: lieu.id },
        data: lieuPrismaDataFromOAuthApiLieu(lieu),
      })
      updated++
      continue
    }

    // create if not existing
    const data = lieuPrismaDataFromOAuthApiLieu(lieu)
    await prismaClient.rdvLieu.upsert({
      where: { id: lieu.id },
      update: data,
      create: data,
    })
    created++
  }
  appendLog(
    `imported ${lieux.length} lieux, ${noop} noop, ${updated} updated, ${created} created`,
  )
  return lieux.map((lieu) => lieu.id)
}

const userPrismaDataFromOAuthApiUser = (
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
    responsibleId: user.responsible_id,
    syncedAt: new Date(),
  } satisfies Prisma.RdvUserUncheckedCreateInput
}

const importUsers = async ({
  existingUsersMap,
  chunkRdvs,
  appendLog,
  skipExistingUserIds,
}: {
  existingUsersMap: Map<number, ExistingRdv['participations'][number]['user']>
  chunkRdvs: OAuthApiRdv[]
  appendLog: AppendLog
  skipExistingUserIds: Set<number>
}) => {
  console.log('skip users', skipExistingUserIds)
  const usersWithDuplicates = chunkRdvs.flatMap((rdv) =>
    rdv.participations.map((participation) => participation.user),
  )
  const users = [
    ...new Map(usersWithDuplicates.map((user) => [user.id, user])).values(),
  ].filter((user) => !skipExistingUserIds.has(user.id))
  console.log('users', users)
  appendLog(`importing ${users.length} users`)
  let noop = 0
  let updated = 0
  let created = 0
  for (const user of users) {
    const existingUser = existingUsersMap.get(user.id)
    if (existingUser) {
      // no-op if no diff
      if (!userHasDiff(existingUser, user)) {
        noop++
        continue
      }

      // update if existing
      await prismaClient.rdvUser.update({
        where: { id: user.id },
        data: userPrismaDataFromOAuthApiUser(user),
      })
      updated++
      continue
    }

    // create if not existing
    const data = userPrismaDataFromOAuthApiUser(user)
    await prismaClient.rdvUser.upsert({
      where: { id: user.id },
      update: data,
      create: data,
    })
    created++
  }
  appendLog(
    `imported ${users.length} users, ${noop} noop, ${updated} updated, ${created} created`,
  )
  return users.map((user) => user.id)
}

// TODO more checks
const rdvHasDiff = (existing: ExistingRdv, rdv: OAuthApiRdv) => {
  console.log('diff existing', existing)
  console.log('diff api rdv', rdv)
  return (
    existing.status !== rdv.status ||
    existing.durationInMin !== rdv.duration_in_min ||
    existing.name !== rdv.name ||
    existing.endsAt.toISOString() !== rdv.ends_at ||
    existing.startsAt.toISOString() !== rdv.starts_at ||
    existing.lieuId !== rdv.lieu?.id ||
    existing.lieu?.name !== rdv.lieu?.name ||
    existing.lieu?.address !== rdv.lieu?.address ||
    existing.lieu?.phoneNumber !== rdv.lieu?.phone_number ||
    existing.lieu?.singleUse !== rdv.lieu?.single_use ||
    existing.motifId !== rdv.motif.id ||
    existing.organisationId !== rdv.organisation.id ||
    existing.organisation?.name !== rdv.organisation.name ||
    existing.organisation?.email !== rdv.organisation.email ||
    existing.organisation?.phoneNumber !== rdv.organisation.phone_number ||
    existing.participations.length !== rdv.participations.length ||
    existing.participations.some((participation) =>
      participationHasDiff(participation, rdv.participations[0]),
    )
  )
}

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
    rawData: rdv,
  } satisfies Prisma.RdvUncheckedCreateInput
}

const rdvParticipationPrismaDataFromOAuthApiParticipation = (
  participation: OAuthApiRdv['participations'][number],
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

const importRdv = async ({
  rdv,
  appendLog,
  existing,
  rdvAccountId,
}: {
  rdv: OAuthApiRdv
  existing?: ExistingRdv
  rdvAccountId: number
  appendLog: AppendLog
}) => {
  if (existing) {
    if (!rdvHasDiff(existing, rdv)) {
      // No diff, no need to import
      appendLog(`no diff for rdv ${rdv.id}, skipping`)
      return
    }

    // Diff, delete the aggregate root (associated data), and update the aggregate root and re-create associated data
    appendLog(`existing rdv ${rdv.id}, updating data`)
    await prismaClient.$transaction(async (tx) => {
      await tx.rdvParticipation.deleteMany({
        where: {
          rdvId: existing.id,
        },
      })
      await tx.rdv.update({
        where: {
          id: existing.id,
        },
        data: rdvPrismaDataFromOAuthApiRdv(rdv, rdvAccountId),
      })
      await tx.rdvParticipation.createMany({
        data: rdv.participations.map((participation) =>
          rdvParticipationPrismaDataFromOAuthApiParticipation(
            participation,
            existing.id,
          ),
        ),
      })
    })

    return
  }

  // Not existing, create the aggregate root and associated data
  appendLog(`importing rdv ${rdv.id}`)
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

const deleteRdvs = async ({
  rdvIds,
  appendLog,
}: {
  rdvIds: number[]
  appendLog: AppendLog
}) => {
  appendLog(`deleting ${rdvIds.length} rdvs`)
  await prismaClient.rdv.deleteMany({ where: { id: { in: rdvIds } } })
  appendLog(`deleted ${rdvIds.length} rdvs`)
}

export const importRdvs = async ({
  user,
  mediateurId,
  rdvAccount,
  appendLog,
  batchSize = 250,
}: {
  user: UserId & UserWithExistingRdvAccount
  rdvAccount: OAuthRdvApiCredentialsWithId
  mediateurId: string
  appendLog: AppendLog
  batchSize?: number
}) => {
  appendLog('import rdvs')
  const startsAfter = user.rdvAccount.syncFrom
    ? dateAsIsoDay(new Date(user.rdvAccount.syncFrom))
    : undefined

  appendLog(
    `fetching rdvs for account ${rdvAccount.id} from ${startsAfter ?? 'all time'}`,
  )

  const [importedRdvIds, { rdvs }] = await Promise.all([
    getImportedRdvIds({ rdvAccountId: rdvAccount.id }),
    oAuthRdvApiListRdvs({
      rdvAccount,
      params: {
        agent_id: rdvAccount.id,
        starts_after: startsAfter,
      },
    }),
  ])
  appendLog(`already imported ${importedRdvIds.length} rdvs in database`)
  appendLog(`fetched ${rdvs.length} rdvs from RDV API`)

  // We will delete the rdvs that are imported in the database but no more in the API
  const importedRdvsToDelete = new Set(importedRdvIds)

  // This will keep track of the ids of the users and lieux that are imported in the database
  // To avoid doing the same thing twice in different chunks
  const importedUserIds = new Set<number>()
  const importedLieuIds = new Set<number>()

  const chunks = chunk(rdvs, batchSize)

  for (const chunkIndex in chunks) {
    appendLog(`importing chunk ${chunkIndex} of ${chunks.length} rdvs`)
    const chunkRdvs = chunks[chunkIndex]
    const existingRdvs = await findExistingRdvs({
      rdvIds: chunkRdvs.map((rdv) => rdv.id),
    })
    const { existingRdvsMap, existingUsersMap, existingLieuxMap } =
      normalizeExistingRdvData(existingRdvs)
    // First step is to synchonize dependent data
    // Organisations are already synchronized
    // 1 - users
    // 2 - lieux
    // The Rdv+Participations can be imported in the last step

    const chunkImportedUserIds = await importUsers({
      existingUsersMap,
      chunkRdvs,
      appendLog,
      skipExistingUserIds: importedUserIds,
    })
    for (const id of chunkImportedUserIds) importedUserIds.add(id)
    const chunkImportedLieuIds = await importLieux({
      existingLieuxMap,
      chunkRdvs,
      appendLog,
      skipExistingLieuIds: importedLieuIds,
    })
    for (const id of chunkImportedLieuIds) importedLieuIds.add(id)
    await Promise.all(
      chunkRdvs.map(async (rdv) => {
        importedRdvsToDelete.delete(rdv.id)
        await importRdv({
          rdv,
          appendLog,
          existing: existingRdvsMap.get(rdv.id),
          rdvAccountId: rdvAccount.id,
        })
      }),
    )
  }

  await deleteRdvs({ rdvIds: [...importedRdvsToDelete], appendLog })

  appendLog(`imported ${rdvs.length} rdvs`)
}
