import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const evenementsWebhook = ['created', 'updated', 'destroyed'] as const

export const EvenementWebhook = defineModel(
  z.enum(evenementsWebhook).brand('EvenementWebhook'),
)

export type EvenementWebhook = Model.TypeOf<typeof EvenementWebhook>
