import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const LIGNES_PAR_DEFAUT = 20

export const NumeroDePage = defineModel(
  z.coerce.number().int().min(1).catch(1).brand('NumeroDePage'),
)

export type NumeroDePage = Model.TypeOf<typeof NumeroDePage>

export const LignesParPage = defineModel(
  z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .catch(LIGNES_PAR_DEFAUT)
    .brand('LignesParPage'),
)

export type LignesParPage = Model.TypeOf<typeof LignesParPage>
