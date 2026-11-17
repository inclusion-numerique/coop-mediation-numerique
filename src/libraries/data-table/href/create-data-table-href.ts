import type { DataTableUrlState } from '../data-table-url-state'

/**
 * Construit un href en sérialisant l'état de table dans la query string.
 * Les valeurs vides (null/undefined/'') sont omises pour garder des URLs propres.
 */
export const createDataTableHref = (
  baseHref: string,
  state: DataTableUrlState,
): string => {
  const entries = Object.entries(state)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    )
    .map(([key, value]): [string, string] => [key, String(value)])

  return `${baseHref}?${new URLSearchParams(Object.fromEntries(entries)).toString()}`
}
