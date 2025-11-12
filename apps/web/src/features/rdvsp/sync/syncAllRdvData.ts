import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { prismaClient } from '@app/web/prismaClient'
import { getUserContextForOAuthApiCall } from '@app/web/rdv-service-public/getUserContextForRdvApiCall'
import {
  UserId,
  UserMediateur,
  UserWithExistingRdvAccount,
} from '@app/web/utils/user'
import type { Prisma } from '@prisma/client'
import { importOrganisations } from './importOrganisations'
import { importRdvs } from './importRdvs'
import { installWebhooks } from './installWebhooks'
import { refreshRdvAgentAccountData } from './refreshRdvAgentAccountData'
import {
  computeSyncDrift,
  emptySyncModelResult,
  type SyncResult,
} from './syncLog'

export type AppendLog = (log: string | string[]) => void

export const syncAllRdvData = async ({
  user,
  organisationIds,
}: {
  user: UserWithExistingRdvAccount & UserId & UserMediateur
  organisationIds?: number[] // scopes the refresh to only these organisations, empty array means: no-op do nothing
}) => {
  if (organisationIds && organisationIds.length > 0) {
    // if we are only syncing a subset of organisations, we return an empty sync result if no organisations are passed in params
    return computeSyncDrift({
      rdvs: emptySyncModelResult,
      organisations: emptySyncModelResult,
      webhooks: emptySyncModelResult,
      users: emptySyncModelResult,
      motifs: emptySyncModelResult,
      lieux: emptySyncModelResult,
    })
  }
  const { rdvAccount: rdvAccountForFirstCall } =
    await getUserContextForOAuthApiCall({ user })

  const syncLogData: Prisma.RdvSyncLogUncheckedCreateInput = {
    rdvAccountId: rdvAccountForFirstCall.id,
    started: new Date(),
    organisationIds,
    ended: null,
    error: null,
    log: '',
  }

  const createdSyncLog = await prismaClient.rdvSyncLog.create({
    data: syncLogData,
  })

  const start = Date.now()
  const appendLog = (log: string | string[]) => {
    if (Array.isArray(log)) {
      return log.forEach(appendLog)
    }
    const time = Math.round((Date.now() - start) / 1000)
    const line = `[rdv-sync:${rdvAccountForFirstCall.id}][${time}s] ${log}`
    syncLogData.log += line
    syncLogData.log += '\n'
  }

  try {
    await refreshRdvAgentAccountData({
      rdvAccount: rdvAccountForFirstCall,
      appendLog,
    })

    // After the first call, the credentials may have been refreshed, we grab the updated account
    const { rdvAccount } = await getUserContextForOAuthApiCall({ user })

    const organisationsImport = await importOrganisations({
      rdvAccount,
      appendLog,
      organisationIds,
    })
    const updatedRdvAccountOrganisations =
      await prismaClient.rdvAccount.findUniqueOrThrow({
        where: { id: rdvAccount.id },
        include: {
          organisations: {
            include: {
              organisation: true,
            },
          },
        },
      })
    rdvAccount.organisations = updatedRdvAccountOrganisations.organisations

    const rdvsImport = user.mediateur
      ? await importRdvs({
          rdvAccount,
          mediateurId: user.mediateur.id,
          user,
          appendLog,
          organisationIds,
        })
      : null

    const webhooksImport = await installWebhooks({
      rdvAccount,
      appendLog,
      organisationIds,
    })

    // Build sync result
    const syncResult: SyncResult = {
      rdvs: rdvsImport?.rdvs ?? emptySyncModelResult,
      organisations: organisationsImport.result,
      webhooks: webhooksImport,
      users: rdvsImport?.users ?? emptySyncModelResult,
      motifs: rdvsImport?.motifs ?? emptySyncModelResult,
      lieux: rdvsImport?.lieux ?? emptySyncModelResult,
      invalidWebhookOrganisationIds:
        webhooksImport.invalidWebhookOrganisationIds === null
          ? undefined
          : webhooksImport.invalidWebhookOrganisationIds,
    }

    // Compute drift
    const syncResultWithDrift = computeSyncDrift(syncResult)

    await prismaClient.rdvAccount.update({
      where: { id: rdvAccount.id },
      data: {
        lastSynced: new Date(),
        error: null,
      },
    })

    const updateData = {
      ended: new Date(),
      drift: syncResultWithDrift.drift,

      rdvsDrift: syncResultWithDrift.rdvs.drift,
      rdvsNoop: syncResultWithDrift.rdvs.noop,
      rdvsCreated: syncResultWithDrift.rdvs.created,
      rdvsUpdated: syncResultWithDrift.rdvs.updated,
      rdvsDeleted: syncResultWithDrift.rdvs.deleted,

      organisationsDrift: syncResultWithDrift.organisations.drift,
      organisationsNoop: syncResultWithDrift.organisations.noop,
      organisationsCreated: syncResultWithDrift.organisations.created,
      organisationsUpdated: syncResultWithDrift.organisations.updated,
      organisationsDeleted: syncResultWithDrift.organisations.deleted,

      webhooksDrift: syncResultWithDrift.webhooks.drift,
      webhooksNoop: syncResultWithDrift.webhooks.noop,
      webhooksCreated: syncResultWithDrift.webhooks.created,
      webhooksUpdated: syncResultWithDrift.webhooks.updated,
      webhooksDeleted: syncResultWithDrift.webhooks.deleted,

      usersDrift: syncResultWithDrift.users.drift,
      usersNoop: syncResultWithDrift.users.noop,
      usersCreated: syncResultWithDrift.users.created,
      usersUpdated: syncResultWithDrift.users.updated,
      usersDeleted: syncResultWithDrift.users.deleted,

      motifsDrift: syncResultWithDrift.motifs.drift,
      motifsNoop: syncResultWithDrift.motifs.noop,
      motifsCreated: syncResultWithDrift.motifs.created,
      motifsUpdated: syncResultWithDrift.motifs.updated,
      motifsDeleted: syncResultWithDrift.motifs.deleted,

      lieuxDrift: syncResultWithDrift.lieux.drift,
      lieuxNoop: syncResultWithDrift.lieux.noop,
      lieuxCreated: syncResultWithDrift.lieux.created,
      lieuxUpdated: syncResultWithDrift.lieux.updated,
      lieuxDeleted: syncResultWithDrift.lieux.deleted,
      rdvsCount: rdvsImport?.rdvs.count ?? 0,
      organisationsCount: organisationsImport.count,
      webhooksCount: webhooksImport.count,
      usersCount: rdvsImport?.users.count ?? 0,
      motifsCount: rdvsImport?.motifs.count ?? 0,
      lieuxCount: rdvsImport?.lieux.count ?? 0,

      log: syncLogData.log,

      organisationIds,
    }

    await prismaClient.rdvSyncLog.update({
      where: { id: createdSyncLog.id },
      data: updateData,
    })

    return syncResultWithDrift
  } catch (error) {
    appendLog('sync failed')
    const message = error instanceof Error ? error.message : 'Unknown error'
    try {
      await prismaClient.rdvSyncLog.update({
        where: { id: createdSyncLog.id },
        data: {
          ended: new Date(),
          error: message,
          log: `${syncLogData.log}\n\nError:|-\n${error}`,
        },
      })
    } catch {
      appendLog('failed to persist error to rdvSyncLog')
    }
    // error already persisted above
    throw error
  }
}
