import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
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
    ) &&
    webhook.secret === ServerWebAppConfig.RdvServicePublic.webhookSecret
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
}) => {
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
    return
  }

  if (!coopEndpoint) {
    if (webhookUrl.includes('localhost')) {
      appendLog(`skipping webhook installation for local environment`)
      return
    }

    appendLog(
      `no existing coop endpoint found for organisation ${organisationId}, creating new one`,
    )
    // Create
    const created = await oAuthRdvApiCreateWebhook({
      rdvAccount,
      organisationId,
      target_url: webhookUrl,
      subscriptions: webhookSubscriptions,
      secret: ServerWebAppConfig.RdvServicePublic.webhookSecret,
    })
    return created
  }

  // Update
  appendLog(`updating coop endpoint ${coopEndpoint.id}`)
  const updated = await oAuthRdvApiPatchWebhook({
    rdvAccount,
    organisationId,
    webhookId: coopEndpoint.id,
    target_url: webhookUrl,
    subscriptions: webhookSubscriptions,
    secret: ServerWebAppConfig.RdvServicePublic.webhookSecret,
  })
  return updated
}

/**
 * Install webhooks for a given RDV account
 * Organisations should already have been synced before calling this function
 */
export const installWebhooks = async ({
  rdvAccount,
  appendLog,
}: {
  rdvAccount: OauthRdvApiCredentialsWithOrganisations
  appendLog: AppendLog
}) => {
  appendLog(
    `installing webhooks for account ${rdvAccount.id} with ${rdvAccount.organisations.length} organisations`,
  )
  const webhooks = await Promise.all(
    rdvAccount.organisations.map(async (organisation) => {
      return installWebhookForOrganisation({
        rdvAccount,
        organisationId: organisation.organisationId,
        appendLog,
      })
    }),
  )

  appendLog(`installed ${webhooks.length} webhooks`)
  return webhooks
}
