import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { OrganisationId } from './organisation-id'

export const WebhookId = defineModel(
  z.number().int().positive().brand('WebhookId'),
)
export type WebhookId = Model.TypeOf<typeof WebhookId>

export const abonnementsWebhook = [
  'rdv',
  'absence',
  'plage_ouverture',
  'user',
  'user_profile',
  'organisation',
  'motif',
  'lieu',
  'agent',
  'agent_role',
  'referent_assignation',
] as const

/**
 * Modèle dont RDV Service Public notifie les changements. Les valeurs sont
 * celles de leur API, reprises telles quelles — la liste complète, celle que
 * leur validation accepte, et non l'échantillon donné en exemple dans leur
 * documentation.
 */
export const AbonnementWebhook = defineModel(
  z.enum(abonnementsWebhook).brand('AbonnementWebhook'),
)
export type AbonnementWebhook = Model.TypeOf<typeof AbonnementWebhook>

/**
 * Ce à quoi La Coop s'abonne : les deux modèles qu'elle sait traiter, et rien de
 * plus.
 *
 * S'abonner largement n'est pas neutre. RDV Service Public rejoue l'intégralité
 * des enregistrements de chaque modèle abonné à chaque pose ou reconfiguration
 * de webhook — motifs, lieux, agents et rôles compris. Tout ce qui n'est ni un
 * rendez-vous ni un usager serait reçu pour être jeté.
 */
export const abonnementsDeLaCoop: readonly AbonnementWebhook[] = [
  AbonnementWebhook('rdv'),
  AbonnementWebhook('user'),
]

/**
 * Webhook posé par La Coop sur une organisation. Le secret n'en fait pas
 * partie : RDV Service Public ne le renvoie jamais, il ne peut donc pas être
 * comparé — c'est aussi pourquoi `estAJour` ne regarde que les abonnements.
 */
export type WebhookInstalle = {
  readonly id: WebhookId
  readonly organisationId: OrganisationId
  readonly abonnements: readonly AbonnementWebhook[]
}

/**
 * Un webhook déjà posé n'a besoin d'être reconfiguré que si sa liste
 * d'abonnements diffère de celle attendue — un abonnement ajouté côté Coop doit
 * être poussé, un abonnement en trop ne doit pas l'être en silence.
 */
export const estAJour = (
  webhook: WebhookInstalle,
  attendus: readonly AbonnementWebhook[] = abonnementsDeLaCoop,
): boolean =>
  webhook.abonnements.length === attendus.length &&
  attendus.every((attendu) => webhook.abonnements.includes(attendu))
