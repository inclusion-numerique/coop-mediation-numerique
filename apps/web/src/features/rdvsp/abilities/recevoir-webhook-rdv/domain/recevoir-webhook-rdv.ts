import type { Result } from '@app/web/libraries/result'
import type { EvenementWebhook } from '../../../domain/evenement-webhook'
import type { OrganisationId } from '../../../domain/organisation-id'
import type { Rdv } from '../../../domain/rdv'
import type { RdvAgentId } from '../../../domain/rdv-agent-id'
import type { RdvId } from '../../../domain/rdv-id'
import type { RdvConnu } from './decision-webhook'

export type RaisonNonTraitee =
  | 'payloadInexploitable'
  | 'aucunAgent'
  | 'compteInconnu'

/**
 * Issue d'une notification. Elle ne rend jamais d'erreur : une notification que
 * La Coop ne sait pas traiter n'est pas une défaillance du service émetteur, et
 * lui répondre en échec le ferait réessayer sans fin.
 */
export type ResultatWebhookRdv =
  | { readonly _tag: 'traite'; readonly action: 'enregistre' | 'supprime' }
  | { readonly _tag: 'ignore'; readonly raison: string }

export type RecevoirWebhookRdv = (input: {
  readonly evenement: EvenementWebhook
  readonly payload: unknown
}) => Promise<ResultatWebhookRdv>

/**
 * Traduit la notification, ou renonce.
 *
 * L'agent en est extrait au passage : c'est lui qui désigne le compte concerné,
 * la notification n'en portant aucun autre indice.
 */
export type LireNotificationRdv = (
  payload: unknown,
) => Result<{ agentId: RdvAgentId; rdv: Rdv }, RaisonNonTraitee>

/**
 * L'organisation du rendez-vous est-elle déjà connue de La Coop ?
 *
 * Seule la synchronisation crée les organisations. Une notification peut la
 * précéder — un agent rejoint une organisation, RDV Service Public notifie avant
 * la passe suivante — et l'écriture butait alors sur la clé étrangère, rendant
 * un 500 là où la route promet de renoncer proprement.
 */
export type OrganisationConnue = (
  organisationId: OrganisationId,
) => Promise<boolean>

export type ComptePourWebhook = (agentId: RdvAgentId) => Promise<{
  readonly synchroniserDepuis: Date | null
  readonly mediateurId: string | null
} | null>

export type RdvConnuParId = (rdvId: RdvId) => Promise<RdvConnu | null>

export type EnregistrerRdvDeLaNotification = (input: {
  readonly rdv: Rdv
  readonly brut: unknown
}) => Promise<void>

export type SupprimerRdvDeLaNotification = (rdvId: RdvId) => Promise<void>

export type RapprocherBeneficiairesDuRdv = (input: {
  readonly rdv: Rdv
  readonly mediateurId: string
}) => Promise<void>
