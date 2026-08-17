import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const evenementsWebhook = ['created', 'updated', 'destroyed'] as const

/**
 * Événement annoncé par RDV Service Public. `created` et `updated` reçoivent le
 * même traitement : rien ne garantit l'ordre d'arrivée des notifications, et un
 * `created` peut porter sur un rendez-vous que La Coop détient déjà.
 */
export const EvenementWebhook = defineModel(
  z.enum(evenementsWebhook).brand('EvenementWebhook'),
)

export type EvenementWebhook = Model.TypeOf<typeof EvenementWebhook>
