import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const SourceExterne = defineModel(
  z.enum(['Cartographie', 'Annuaire']).brand('SourceExterne'),
)

export type SourceExterne = Model.TypeOf<typeof SourceExterne>
