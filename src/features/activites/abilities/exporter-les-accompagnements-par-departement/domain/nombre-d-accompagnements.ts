import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const NombreDAccompagnements = defineModel(
  z.number().int().nonnegative().brand('NombreDAccompagnements'),
)

export type NombreDAccompagnements = Model.TypeOf<typeof NombreDAccompagnements>
