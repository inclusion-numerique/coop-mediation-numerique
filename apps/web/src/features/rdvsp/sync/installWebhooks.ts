import { prismaClient } from '@app/web/prismaClient'
import {
  OAuthRdvApiCredentials,
  OauthRdvApiCredentialsWithOrganisations,
  oAuthRdvApiCreateWebhook,
  oAuthRdvApiListWebhooks,
  oAuthRdvApiPatchWebhook,
} from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import {
  RdvApiWebhookEndpoint,
  RdvApiWebhookSubscription,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { getServerUrl } from '@app/web/utils/baseUrl'
import type { AppendLog } from './syncAllRdvData'
import type { SyncModelResult, SyncOperation } from './syncLog'

const webhookUrl = getServerUrl('/api/rdv-service-public/webhook', {
  absolutePath: true,
})

const webhookSubscriptions = [
  'rdv',
  'user',
  'user_profile',
  'organisation',
  'motif',
  'lieu',
  'agent',
  'agent_role',
] as const satisfies RdvApiWebhookSubscription[]

const isAlreadyInstalled = (webhook: RdvApiWebhookEndpoint) => {
  return (
    webhook.subscriptions.length === webhookSubscriptions.length &&
    webhookSubscriptions.every((subscription) =>
      webhook.subscriptions.includes(subscription),
    )
    // TODO: secret does not work, it is not returned by rdvsp api
    // && webhook.secret === ServerWebAppConfig.RdvServicePublic.webhookSecret
  )
}

export const installWebhookForOrganisation = async ({
  rdvAccount,
  organisationId,
  appendLog,
}: {
  rdvAccount: OAuthRdvApiCredentials
  organisationId: number
  appendLog: AppendLog
}): Promise<{
  syncOperation: SyncOperation
  invalidInstallation: boolean
  organisationId: number
}> => {
  const existing = await oAuthRdvApiListWebhooks({
    rdvAccount,
    organisationId,
    params: {
      target_url: webhookUrl,
    },
  })

  appendLog(
    `found ${existing.webhook_endpoints.length} webhooks for organisation ${organisationId}`,
  )

  // we double check to avoid creating a mess if api is not consistent
  const coopEndpoint = existing.webhook_endpoints.find(
    (webhook) => webhook.target_url === webhookUrl,
  )

  if (coopEndpoint && isAlreadyInstalled(coopEndpoint)) {
    appendLog(
      `found existing coop endpoint ${coopEndpoint.id} with all subscriptions, skipping`,
    )

    // Already installed
    return { syncOperation: 'noop', invalidInstallation: false, organisationId }
  }

  if (!coopEndpoint) {
    if (webhookUrl.includes('localhost')) {
      appendLog(`skipping webhook installation for local environment`)
      return {
        syncOperation: 'noop',
        invalidInstallation: false,
        organisationId,
      }
    }

    appendLog(
      `no existing coop endpoint found for organisation ${organisationId}, creating new one`,
    )
    appendLog(`existing webhooks: ${existing.webhook_endpoints.length}`)
    for (const webhook of existing.webhook_endpoints) {
      appendLog(
        `webhook ${rdvAccount.id}:${webhook.id} - ${webhook.target_url} - ${webhook.subscriptions.join(', ')}`,
      )
    }
    // Create
    const created = await oAuthRdvApiCreateWebhook({
      rdvAccount,
      organisationId,
      target_url: webhookUrl,
      subscriptions: webhookSubscriptions,
      secret: ServerWebAppConfig.RdvServicePublic.webhookSecret,
    })

    appendLog(`created webhook ${JSON.stringify(created)}`)

    // RDVSP does not allows webhook creation for agents that are not admin of the organisation
    // we have to fetch again to see if it exists after creation (successful install)

    const existingWebhooksPostInstallation = await oAuthRdvApiListWebhooks({
      rdvAccount,
      organisationId,
      params: {
        target_url: webhookUrl,
      },
    })

    if (existingWebhooksPostInstallation.webhook_endpoints.length > 0) {
      return {
        syncOperation: 'created',
        invalidInstallation: false,
        organisationId,
      }
    }

    // webhook does not exist after creation, it means it was not successful
    // we mark as noop to avoid a "drift" count on the sync (as it is not a real drift)
    return {
      syncOperation: 'noop',
      invalidInstallation: true,
      organisationId,
    }
  }

  // Update
  appendLog(`updating coop endpoint ${coopEndpoint.id}`)
  await oAuthRdvApiPatchWebhook({
    rdvAccount,
    organisationId,
    webhookId: coopEndpoint.id,
    target_url: webhookUrl,
    subscriptions: webhookSubscriptions,
    secret: ServerWebAppConfig.RdvServicePublic.webhookSecret,
  })

  return {
    syncOperation: 'updated',
    invalidInstallation: false,
    organisationId,
  }
}

/**
 * Install webhooks for a given RDV account
 * Organisations should already have been synced before calling this function
 */
export const installWebhooks = async ({
  rdvAccount,
  appendLog,
  organisationIds,
}: {
  rdvAccount: OauthRdvApiCredentialsWithOrganisations
  appendLog: AppendLog
  organisationIds?: number[] // scopes the refresh to only these organisations, empty array means: no-op do nothing
}): Promise<
  SyncModelResult & {
    count: number
    invalidWebhookOrganisationIds: number[] | null // null means we did not check for invalid webhooks
  }
> => {
  appendLog(
    `installing webhooks for account ${rdvAccount.id} with ${rdvAccount.organisations.length} organisations`,
  )
  const webhookOperations = await Promise.all(
    rdvAccount.organisations
      .filter((organisation) =>
        organisationIds
          ? organisationIds.includes(organisation.organisationId)
          : true,
      )
      .map((organisation) =>
        installWebhookForOrganisation({
          rdvAccount,
          organisationId: organisation.organisationId,
          appendLog,
        }),
      ),
  )

  const result: SyncModelResult = {
    noop: webhookOperations.filter((op) => op.syncOperation === 'noop').length,
    created: webhookOperations.filter((op) => op.syncOperation === 'created')
      .length,
    updated: webhookOperations.filter((op) => op.syncOperation === 'updated')
      .length,
    deleted: 0,
  }

  // Only update invalid state if full sync was performed
  let invalidWebhookOrganisationIds: number[] | null = null
  if (!organisationIds) {
    invalidWebhookOrganisationIds = webhookOperations
      .filter((op) => op.invalidInstallation)
      .map((op) => op.organisationId)

    await prismaClient.rdvAccount.update({
      where: { id: rdvAccount.id },
      data: {
        invalidWebhookOrganisationIds,
      },
    })
  }

  return {
    ...result,
    count: rdvAccount.organisations.length,
    invalidWebhookOrganisationIds,
  }
}
