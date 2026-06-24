import type { SortDirection } from '@arckit/resultset'
import classNames from 'classnames'
import type { DataTableUrlState } from '../data-table-url-state'
import { createSortLinkProps } from './create-sort-link-props'
import { SortLink } from './SortLink'

/**
 * En-tête de colonne triable : libellé + lien de tri. Générique, agnostique du
 * domaine (la feature fournit le nom de colonne `tri` et l'état d'URL).
 */
export const SortableColumnHeader = ({
  label,
  tri,
  state,
  baseHref,
  isDefault,
  defaultDirection,
  className,
}: {
  label: string
  tri: string
  state: DataTableUrlState
  baseHref: string
  isDefault?: boolean
  defaultDirection?: SortDirection
  className?: string
}) => (
  <th scope="col" className={classNames(className)}>
    {label}
    <SortLink
      label={label}
      {...createSortLinkProps({
        baseHref,
        state,
        tri,
        isDefault,
        defaultDirection,
      })}
    />
  </th>
)
