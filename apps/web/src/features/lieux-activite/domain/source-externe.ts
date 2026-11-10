import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const SourceExterne = defineModel(
  z.enum(['Cartographie', 'Annuaire']).brand('SourceExterne'),
)

export type SourceExterne = Model.TypeOf<typeof SourceExterne>
