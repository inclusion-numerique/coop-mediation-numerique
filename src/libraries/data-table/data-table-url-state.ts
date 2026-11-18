import type { SortDirection } from '@arckit/resultset'

/**
 * Forme générique de l'état d'une table porté par les paramètres d'URL.
 * Les composants de cette library sont agnostiques du domaine : ils ne
 * connaissent que ces clés. Chaque feature mappe ses propres champs vers/depuis
 * cette forme (cf. l'adaptateur `*-search-params.ts` de la feature).
 */
export type DataTableUrlState = {
  readonly recherche?: string
  readonly tri?: string
  readonly ordre?: SortDirection
  readonly page?: string
  readonly lignes?: string
}
