import type { BilanSynchronisation } from '../../../domain/compte/bilan-synchronisation'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'

export type ResultatSynchronisation = {
  readonly bilan: BilanSynchronisation
  readonly derive: number
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
}
