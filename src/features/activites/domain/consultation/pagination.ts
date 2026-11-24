import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const LIGNES_PAR_PAGE = [10, 20, 50, 100] as const

export const LIGNES_PAR_DEFAUT = 50

export const NumeroDePage = defineModel(
  z.number().int().min(1).brand('NumeroDePage'),
)

export type NumeroDePage = Model.TypeOf<typeof NumeroDePage>

export const LignesParPage = defineModel(
  z
    .number()
    .int()
    .refine((lignes) =>
      LIGNES_PAR_PAGE.some((proposees) => proposees === lignes),
    )
    .brand('LignesParPage'),
)

export type LignesParPage = Model.TypeOf<typeof LignesParPage>

export type Pagination = {
  readonly page: NumeroDePage
  readonly lignesParPage: LignesParPage
}
