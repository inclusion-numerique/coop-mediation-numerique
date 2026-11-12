import { defineModel, type Model } from '@app/web/libraries/model'
import {
  premiereValeur,
  type ValeurDeParametre,
  valeurLue,
} from '@app/web/libraries/parametres-d-url'
import { z } from 'zod'

export const LIGNES_PAR_PAGE = [10, 20, 50, 100] as const

const LIGNES_PAR_DEFAUT = 50

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

const nombre = (valeur: ValeurDeParametre): number =>
  Number(premiereValeur(valeur) ?? Number.NaN)

export const paginationLue = ({
  page,
  lignes,
}: {
  readonly page?: ValeurDeParametre
  readonly lignes?: ValeurDeParametre
}): Pagination => ({
  page: valeurLue(NumeroDePage.schema, nombre(page)) ?? NumeroDePage(1),
  lignesParPage:
    valeurLue(LignesParPage.schema, nombre(lignes)) ??
    LignesParPage(LIGNES_PAR_DEFAUT),
})
