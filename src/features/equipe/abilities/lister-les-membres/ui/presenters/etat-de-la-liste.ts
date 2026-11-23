import type { SortDirection } from '@arckit/resultset'
import type { DataTableUrlState } from '@/libraries/data-table'
import type { ParametresDeLaListe } from './parametres-de-la-liste'

export type EtatDeLaListe = DataTableUrlState & {
  readonly statut?: string
  readonly role?: string
}

const ordresDeTri: ReadonlyMap<string, SortDirection> = new Map([
  ['asc', 'asc'],
  ['desc', 'desc'],
])

export const etatDeLaListe = ({
  recherche,
  tri,
  ordre,
  page,
  lignes,
  statut,
  role,
}: ParametresDeLaListe): EtatDeLaListe => ({
  recherche,
  tri,
  ordre: ordresDeTri.get(ordre ?? ''),
  page,
  lignes,
  statut,
  role,
})
