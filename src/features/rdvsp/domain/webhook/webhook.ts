import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { OrganisationId } from '../identifiants/organisation-id'

export const WebhookId = defineModel(
  z.number().int().positive().brand('WebhookId'),
)
export type WebhookId = Model.TypeOf<typeof WebhookId>

const abonnementsWebhook = [
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

export const AbonnementWebhook = defineModel(
  z.enum(abonnementsWebhook).brand('AbonnementWebhook'),
)
export type AbonnementWebhook = Model.TypeOf<typeof AbonnementWebhook>

export const abonnementsDeLaCoop: readonly AbonnementWebhook[] = [
  AbonnementWebhook('rdv'),
  AbonnementWebhook('user'),
]

export type WebhookInstalle = {
  readonly id: WebhookId
  readonly organisationId: OrganisationId
  readonly abonnements: readonly AbonnementWebhook[]
}

export const estAJour = (
  webhook: WebhookInstalle,
  attendus: readonly AbonnementWebhook[],
): boolean =>
  webhook.abonnements.length === attendus.length &&
  attendus.every((attendu) => webhook.abonnements.includes(attendu))
