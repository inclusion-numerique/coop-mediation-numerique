import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type { Usager } from '../../../domain/usager'
import type {
  BeneficiaireLie,
  RaisonIgnoreUsager,
} from './decision-webhook-usager'

export type AnonymisationDeLUsager = {
  readonly usagerId: UsagerId
  readonly beneficiaires: readonly BeneficiaireLie[]
  readonly anonymiseLe: Date
}

export type WebhookUsagerTraite =
  | { readonly _tag: 'ignore'; readonly raison: RaisonIgnoreUsager }
  | { readonly _tag: 'misAJour'; readonly usager: Usager }
  | ({ readonly _tag: 'anonymiseEtSupprime' } & AnonymisationDeLUsager)
