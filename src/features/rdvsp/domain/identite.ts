import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PrenomExterne = defineModel(
  z.string().trim().min(1).brand('PrenomExterne'),
)
export type PrenomExterne = Model.TypeOf<typeof PrenomExterne>

export const NomExterne = defineModel(
  z.string().trim().min(1).brand('NomExterne'),
)
export type NomExterne = Model.TypeOf<typeof NomExterne>

export const EmailExterne = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('EmailExterne'),
)
export type EmailExterne = Model.TypeOf<typeof EmailExterne>

export const TelephoneExterne = defineModel(
  z.string().trim().min(1).brand('TelephoneExterne'),
)
export type TelephoneExterne = Model.TypeOf<typeof TelephoneExterne>
