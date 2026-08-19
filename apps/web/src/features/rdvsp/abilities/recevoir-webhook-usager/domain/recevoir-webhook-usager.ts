import type { Result } from '@app/web/libraries/result'
import type { EvenementWebhook } from '../../../domain/evenement-webhook'
import type { Usager } from '../../../domain/usager'
import type { UsagerId } from '../../../domain/usager-id'
import type { BeneficiaireLie } from './decision-webhook-usager'

export type ResultatWebhookUsager =
  | {
      readonly _tag: 'traite'
      readonly action: 'misAJour' | 'anonymiseEtSupprime'
    }
  | { readonly _tag: 'ignore'; readonly raison: string }

export type RecevoirWebhookUsager = (input: {
  readonly evenement: EvenementWebhook
  readonly payload: unknown
}) => Promise<ResultatWebhookUsager>

export type LireNotificationUsager = (
  payload: unknown,
) => Result<Usager, 'payloadInexploitable'>

export type BeneficiairesLiesAUsager = (
  usagerId: UsagerId,
) => Promise<readonly BeneficiaireLie[]>

export type MettreAJourUsager = (usager: Usager) => Promise<void>

/**
 * Anonymise les bénéficiaires descendant de l'usager, décrémente les compteurs
 * des médiateurs concernés, délie ce qui reste et supprime l'usager — d'un seul
 * tenant : un effacement à moitié appliqué laisserait des fiches nominatives
 * derrière un usager disparu.
 */
export type AnonymiserEtSupprimerUsager = (input: {
  readonly usagerId: UsagerId
  readonly beneficiaires: readonly BeneficiaireLie[]
  readonly perteParMediateur: ReadonlyMap<string, number>
}) => Promise<void>
