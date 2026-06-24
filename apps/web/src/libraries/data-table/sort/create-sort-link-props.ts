import type { SortDirection } from '@arckit/resultset'
import type { DataTableUrlState } from '../data-table-url-state'
import { createDataTableHref } from '../href/create-data-table-href'

export type SortLinkProps = {
  readonly href: string
  readonly ordre: SortDirection
  readonly isActive: boolean
}

const opposite = (direction: SortDirection): SortDirection =>
  direction === 'desc' ? 'asc' : 'desc'

/**
 * Calcule, pour une colonne `tri`, le lien de tri à afficher : l'état actif et
 * la direction que produira le prochain clic (bascule asc ↔ desc sur la colonne
 * active, sinon `asc`). `isDefault` désigne la colonne triée par défaut quand
 * aucun `tri` n'est présent dans l'URL.
 */
export const createSortLinkProps = ({
  baseHref,
  state,
  tri,
  isDefault = false,
  defaultDirection = 'asc',
}: {
  baseHref: string
  state: DataTableUrlState
  tri: string
  isDefault?: boolean
  defaultDirection?: SortDirection
}): SortLinkProps => {
  const isActiveByDefault = !state.tri && isDefault
  const isActive = isActiveByDefault || state.tri === tri

  const ordre = isActiveByDefault
    ? opposite(defaultDirection)
    : isActive
      ? opposite(state.ordre ?? 'asc')
      : 'asc'

  return {
    isActive,
    ordre,
    href: createDataTableHref(baseHref, { ...state, tri, ordre }),
  }
}
