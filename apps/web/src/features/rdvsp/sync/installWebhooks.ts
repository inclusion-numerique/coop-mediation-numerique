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

const hasAllSubscriptions = (webhook: RdvApiWebhookEndpoint) => {
  return (
    webhook.subscriptions.length === webhookSubscriptions.length &&
    webhookSubscriptions.every((subscription) =>
      webhook.subscriptions.includes(subscription),
    )
  )
}

export const installWebhookForOrganisation = async ({
  rdvAccount,
  organisationId,
}: {
  rdvAccount: OAuthRdvApiCredentials
  organisationId: number
}) => {
  const existing = await oAuthRdvApiListWebhooks({
    rdvAccount,
    organisationId,
    params: {
      target_url: webhookUrl,
    },
  })

  // we double check to avoid creating a mess if api is not consistent
  const coopEndpoint = existing.webhook_endpoints.find(
    (webhook) => webhook.target_url === webhookUrl,
  )

  if (coopEndpoint && hasAllSubscriptions(coopEndpoint)) {
    // Already installed
    return
  }

  if (!coopEndpoint) {
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
}: {
  rdvAccount: OauthRdvApiCredentialsWithOrganisations
}) => {
  const webhooks = await Promise.all(
    rdvAccount.organisations.map(async (organisation) => {
      return installWebhookForOrganisation({
        rdvAccount,
        organisationId: organisation.organisationId,
      })
    }),
  )
  return webhooks
}
