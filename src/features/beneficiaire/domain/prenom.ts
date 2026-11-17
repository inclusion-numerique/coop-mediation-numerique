import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PRENOM_MAX_LENGTH = 100

export const Prenom = defineModel(
  z.string().trim().min(1).max(PRENOM_MAX_LENGTH).brand('Prenom'),
)

export type Prenom = Model.TypeOf<typeof Prenom>
