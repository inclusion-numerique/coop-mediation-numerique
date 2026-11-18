import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NOM_MAX_LENGTH = 100

export const Nom = defineModel(
  z.string().trim().min(1).max(NOM_MAX_LENGTH).brand('Nom'),
)

export type Nom = Model.TypeOf<typeof Nom>
