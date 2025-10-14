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
import type { SyncModelResult } from './syncLog'
import {
  createRdv,
  deleteRdvs,
  lieuPrismaDataFromOAuthApiLieu,
  motifPrismaDataFromOAuthApiMotif,
  updateRdv,
  userPrismaDataFromOAuthApiUser,
} from './syncRdv'

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
      motif: true,
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
  const existingMotifs = existingRdvs
    .map((rdv) => rdv.motif)
    .filter(isDefinedAndNotNull)
  const existingMotifsMap = new Map(
    existingMotifs.map((motif) => [motif.id, motif]),
  )
  return {
    existingRdvsMap,
    existingParticipationsMap,
    existingUsersMap,
    existingLieuxMap,
    existingMotifsMap,
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

const motifHasDiff = (
  existing: {
    id: number
    collectif: boolean
    name: string
    organisationId: number
    followUp: boolean
    instructionForRdv: string | null
    locationType: string | null
    motifCategoryId: number | null
  },
  motif: OAuthApiRdv['motif'],
) => {
  return (
    existing.collectif !== motif.collectif ||
    existing.name !== motif.name ||
    existing.organisationId !== motif.organisation_id ||
    existing.followUp !== motif.follow_up ||
    (existing.instructionForRdv ?? null) !==
      (motif.instruction_for_rdv ?? null) ||
    (existing.locationType ?? null) !== (motif.location_type ?? null) ||
    (existing.motifCategoryId ?? null) !== (motif.motif_category?.id ?? null)
  )
}

// Moved to syncRdv.ts

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
}): Promise<{ importedIds: number[]; result: SyncModelResult }> => {
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
  return {
    importedIds: lieux.map((lieu) => lieu.id),
    result: { noop, created, updated, deleted: 0 },
  }
}

const importMotifs = async ({
  existingMotifsMap,
  chunkRdvs,
  appendLog,
  skipExistingMotifIds,
}: {
  existingMotifsMap: Map<
    number,
    {
      id: number
      collectif: boolean
      name: string
      organisationId: number
      followUp: boolean
      instructionForRdv: string | null
      locationType: string | null
      motifCategoryId: number | null
    }
  >
  chunkRdvs: OAuthApiRdv[]
  appendLog: AppendLog
  skipExistingMotifIds: Set<number>
}): Promise<{ importedIds: number[]; result: SyncModelResult }> => {
  const motifsWithDuplicates = chunkRdvs.map((rdv) => rdv.motif)
  const motifs = [
    ...new Map(motifsWithDuplicates.map((motif) => [motif.id, motif])).values(),
  ].filter((motif) => !skipExistingMotifIds.has(motif.id))
  appendLog(`importing ${motifs.length} motifs`)
  let noop = 0
  let updated = 0
  let created = 0

  for (const motif of motifs) {
    const existingMotif = existingMotifsMap.get(motif.id)

    console.log('MOTIF DIFF COMPUTATION', {
      motif,
      existingMotif,
      diff: existingMotif ? motifHasDiff(existingMotif, motif) : 'unexisting',
    })

    if (existingMotif) {
      // no-op if no diff
      if (!motifHasDiff(existingMotif, motif)) {
        noop++
        continue
      }

      // update if existing
      await prismaClient.rdvMotif.update({
        where: { id: motif.id },
        data: motifPrismaDataFromOAuthApiMotif(motif),
      })
      updated++
      continue
    }

    // create if not existing
    const data = motifPrismaDataFromOAuthApiMotif(motif)
    await prismaClient.rdvMotif.upsert({
      where: { id: motif.id },
      update: data,
      create: data,
    })
    created++
  }
  appendLog(
    `imported ${motifs.length} motifs, ${noop} noop, ${updated} updated, ${created} created`,
  )
  return {
    importedIds: motifs.map((motif) => motif.id),
    result: { noop, created, updated, deleted: 0 },
  }
}

// Moved to syncRdv.ts

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
}): Promise<{ importedIds: number[]; result: SyncModelResult }> => {
  // skipExistingUserIds used to avoid duplicate imports across chunks
  const usersWithDuplicates = chunkRdvs.flatMap((rdv) =>
    rdv.participations.map((participation) => participation.user),
  )
  const users = [
    ...new Map(usersWithDuplicates.map((user) => [user.id, user])).values(),
  ].filter((user) => !skipExistingUserIds.has(user.id))
  // users length is logged through appendLog below
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
  return {
    importedIds: users.map((user) => user.id),
    result: { noop, created, updated, deleted: 0 },
  }
}

// TODO more checks
const rdvHasDiff = (existing: ExistingRdv, rdv: OAuthApiRdv) => {
  // compare existing vs API rdv
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
}): Promise<'noop' | 'updated' | 'created'> => {
  if (existing) {
    if (!rdvHasDiff(existing, rdv)) {
      // No diff, no need to import
      return 'noop'
    }

    // Diff, update the RDV using the atomic update function
    await updateRdv(rdv, rdvAccountId)
    return 'updated'
  }

  // Not existing, create using the atomic create function
  await createRdv(rdv, rdvAccountId)
  return 'created'
}

const deleteRdvsWithLog = async ({
  rdvIds,
  appendLog,
}: {
  rdvIds: number[]
  appendLog: AppendLog
}) => {
  appendLog(`deleting ${rdvIds.length} rdvs`)
  await deleteRdvs(rdvIds)
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
}): Promise<{
  rdvs: SyncModelResult & { count: number }
  users: SyncModelResult & { count: number }
  motifs: SyncModelResult & { count: number }
  lieux: SyncModelResult & { count: number }
}> => {
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

  // This will keep track of the ids of the users, lieux, and motifs that are imported in the database
  // To avoid doing the same thing twice in different chunks
  const importedUserIds = new Set<number>()
  const importedLieuIds = new Set<number>()
  const importedMotifIds = new Set<number>()

  const chunks = chunk(rdvs, batchSize)

  let rdvNoop = 0
  let rdvUpdated = 0
  let rdvCreated = 0

  const usersResult: SyncModelResult = {
    noop: 0,
    created: 0,
    updated: 0,
    deleted: 0,
  }
  const lieuxResult: SyncModelResult = {
    noop: 0,
    created: 0,
    updated: 0,
    deleted: 0,
  }
  const motifsResult: SyncModelResult = {
    noop: 0,
    created: 0,
    updated: 0,
    deleted: 0,
  }

  for (const chunkIndex in chunks) {
    appendLog(`importing chunk ${chunkIndex} of ${chunks.length} rdvs`)
    const chunkRdvs = chunks[chunkIndex]
    const existingRdvs = await findExistingRdvs({
      rdvIds: chunkRdvs.map((rdv) => rdv.id),
    })
    const {
      existingRdvsMap,
      existingUsersMap,
      existingLieuxMap,
      existingMotifsMap,
    } = normalizeExistingRdvData(existingRdvs)
    // First step is to synchonize dependent data
    // Organisations are already synchronized
    // 1 - users
    // 2 - lieux
    // 3 - motifs
    // The Rdv+Participations can be imported in the last step

    const usersImport = await importUsers({
      existingUsersMap,
      chunkRdvs,
      appendLog,
      skipExistingUserIds: importedUserIds,
    })
    for (const id of usersImport.importedIds) importedUserIds.add(id)
    usersResult.noop += usersImport.result.noop
    usersResult.created += usersImport.result.created
    usersResult.updated += usersImport.result.updated

    const lieuxImport = await importLieux({
      existingLieuxMap,
      chunkRdvs,
      appendLog,
      skipExistingLieuIds: importedLieuIds,
    })

    for (const id of lieuxImport.importedIds) importedLieuIds.add(id)

    lieuxResult.noop += lieuxImport.result.noop
    lieuxResult.created += lieuxImport.result.created
    lieuxResult.updated += lieuxImport.result.updated

    const motifsImport = await importMotifs({
      existingMotifsMap,
      chunkRdvs,
      appendLog,
      skipExistingMotifIds: importedMotifIds,
    })
    for (const id of motifsImport.importedIds) importedMotifIds.add(id)
    motifsResult.noop += motifsImport.result.noop
    motifsResult.created += motifsImport.result.created
    motifsResult.updated += motifsImport.result.updated
    await Promise.all(
      chunkRdvs.map(async (rdv) => {
        importedRdvsToDelete.delete(rdv.id)
        const operationDone = await importRdv({
          rdv,
          appendLog,
          existing: existingRdvsMap.get(rdv.id),
          rdvAccountId: rdvAccount.id,
        })
        if (operationDone === 'noop') rdvNoop++
        if (operationDone === 'updated') rdvUpdated++
        if (operationDone === 'created') rdvCreated++
      }),
    )
    appendLog(
      `imported ${chunkRdvs.length} rdvs, ${rdvNoop} noop, ${rdvUpdated} updated, ${rdvCreated} created`,
    )
  }

  const rdvDeletedCount = importedRdvsToDelete.size
  await deleteRdvsWithLog({ rdvIds: [...importedRdvsToDelete], appendLog })

  appendLog(`imported ${rdvs.length} rdvs`)

  return {
    rdvs: {
      noop: rdvNoop,
      created: rdvCreated,
      updated: rdvUpdated,
      deleted: rdvDeletedCount,
      count: rdvs.length,
    },
    users: { ...usersResult, count: importedUserIds.size },
    motifs: { ...motifsResult, count: importedMotifIds.size },
    lieux: { ...lieuxResult, count: importedLieuIds.size },
  }
}
