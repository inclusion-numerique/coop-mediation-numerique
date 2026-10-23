import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Recherche = defineModel(
  z.string().trim().min(1).max(100).brand('Recherche'),
)

export type Recherche = Model.TypeOf<typeof Recherche>
