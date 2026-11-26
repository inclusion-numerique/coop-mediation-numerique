import type { Page, PageSize, Search, Sort } from '@arckit/resultset'

export type ColonneTriable =
  | 'nom'
  | 'creation'
  | 'modification'
  | 'mediateursEnActivite'

export type CriteresDeLaListe = {
  readonly recherche: Search
  readonly tri: Sort<ColonneTriable>
  readonly page: Page
  readonly pageSize: PageSize
}
