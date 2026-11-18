import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const COURRIEL_HASH_LENGTH = 12

export const CourrielHash = defineModel(
  z
    .string()
    .regex(
      new RegExp(`^[A-Za-z0-9_-]{${COURRIEL_HASH_LENGTH}}$`),
      'Hash attendue : 12 caractères base64url',
    )
    .brand('CourrielHash'),
)

export type CourrielHash = Model.TypeOf<typeof CourrielHash>
