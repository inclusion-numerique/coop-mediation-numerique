import type { Page, PageSize, Search, Sort } from '@arckit/resultset'

export const COLONNES_TRIABLES = [
  'nom',
  'creation',
  'modification',
  'mediateursEnActivite',
] as const

export type ColonneTriable = (typeof COLONNES_TRIABLES)[number]

export type CriteresDeLaListe = {
  readonly recherche: Search
  readonly tri: Sort<ColonneTriable>
  readonly page: Page
  readonly pageSize: PageSize
}
