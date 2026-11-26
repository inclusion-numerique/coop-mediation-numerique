import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const statutsPresence = [
  'unknown',
  'seen',
  'excused',
  'revoked',
  'noshow',
] as const

export const StatutPresence = defineModel(
  z.enum(statutsPresence).brand('StatutPresence'),
)

export type StatutPresence = Model.TypeOf<typeof StatutPresence>

const statutsPresenceModifiables = [
  'seen',
  'excused',
  'revoked',
  'noshow',
] as const

export const StatutPresenceModifiable = defineModel(
  z.enum(statutsPresenceModifiables).brand('StatutPresenceModifiable'),
)

export type StatutPresenceModifiable = Model.TypeOf<
  typeof StatutPresenceModifiable
>
