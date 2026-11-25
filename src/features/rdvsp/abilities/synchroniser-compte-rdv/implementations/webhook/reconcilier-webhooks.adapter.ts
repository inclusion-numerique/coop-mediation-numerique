import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { ReconcilierWebhooks } from '../../domain/synchroniser-compte-rdv'
import { noterLesWebhooksInvalides } from '../prisma/webhooks-invalides.mutation'
import {
  type ApiWebhooks,
  installWebhooks,
} from './installer-webhooks.mutation'

export const reconcilierWebhooks =
  (api: ApiWebhooks): ReconcilierWebhooks =>
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
