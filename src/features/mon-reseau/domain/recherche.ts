import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Recherche = defineModel(
  z.string().trim().min(1).max(100).brand('Recherche'),
)

export type Recherche = Model.TypeOf<typeof Recherche>
