import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NombreDAccompagnements = defineModel(
  z.number().int().nonnegative().brand('NombreDAccompagnements'),
)

export type NombreDAccompagnements = Model.TypeOf<typeof NombreDAccompagnements>
