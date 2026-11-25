import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const FILTRES_DE_DISPOSITIF = [
  'ConseillersNumeriques',
  'HorsDispositif',
] as const

export const FiltreDeDispositif = defineModel(
  z.enum(FILTRES_DE_DISPOSITIF).brand('FiltreDeDispositif'),
)

export type FiltreDeDispositif = Model.TypeOf<typeof FiltreDeDispositif>
