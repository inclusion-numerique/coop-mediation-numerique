import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { ReconcilierWebhooks } from '../../domain/synchroniser-compte-rdv'
import {
  type ApiWebhooks,
  installWebhooks,
} from './installer-webhooks.mutation'

type NoterLesWebhooksInvalides = Parameters<
  typeof installWebhooks
>[0]['noterLesWebhooksInvalides']

export const reconcilierWebhooks =
  ({
    api,
    noterLesWebhooksInvalides,
  }: {
    readonly api: ApiWebhooks
    readonly noterLesWebhooksInvalides: NoterLesWebhooksInvalides
  }): ReconcilierWebhooks =>
  async ({ compte, organisationIds }) => {
    const resultat = await installWebhooks({
      compte,
      appendLog: () => undefined,
      ...(organisationIds === undefined
        ? {}
        : { organisationIds: [...organisationIds] }),
      api,
      noterLesWebhooksInvalides,
    })

    return {
      bilan: resultat,
      organisationIdsSansWebhook:
        resultat.invalidWebhookOrganisationIds === null
          ? undefined
          : resultat.invalidWebhookOrganisationIds.map((id) =>
              OrganisationId(id),
            ),
    }
  }
