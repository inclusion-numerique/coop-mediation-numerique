import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const FILTRES_DE_DISPOSITIF = [
  'ConseillersNumeriques',
  'HorsDispositif',
] as const

export const FiltreDeDispositif = defineModel(
  z.enum(FILTRES_DE_DISPOSITIF).brand('FiltreDeDispositif'),
)

export type FiltreDeDispositif = Model.TypeOf<typeof FiltreDeDispositif>
