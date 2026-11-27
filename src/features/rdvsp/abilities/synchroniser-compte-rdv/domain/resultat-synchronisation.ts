import type { BilanSynchronisation } from '../../../domain/compte/bilan-synchronisation'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'

export type OrganisationsSansWebhook =
  | { readonly _tag: 'nonRelevees' }
  | {
      readonly _tag: 'relevees'
      readonly organisationIds: readonly OrganisationId[]
    }

export type ResultatSynchronisation = {
  readonly bilan: BilanSynchronisation
  readonly derive: number
  readonly organisationsSansWebhook: OrganisationsSansWebhook
}
