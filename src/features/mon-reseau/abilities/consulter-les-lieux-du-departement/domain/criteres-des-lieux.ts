import type { Page, PageSize, Search, Sort } from '@arckit/resultset'
import type { CodeInsee } from '@/libraries/insee'

export type ColonneDesLieuxDuReseau = 'nom' | 'modification'

export type CriteresDesLieux = {
  readonly recherche: Search
  readonly communes: readonly CodeInsee[]
  readonly tri: Sort<ColonneDesLieuxDuReseau>
  readonly page: Page
  readonly pageSize: PageSize
}

export const estFiltre = ({ recherche, communes }: CriteresDesLieux): boolean =>
  recherche !== '' || communes.length > 0
