import type { SortDirection } from '@arckit/resultset'
import Link from 'next/link'
import styles from './SortLink.module.css'

/**
 * Bouton-lien de tri d'une colonne. `ordre` est la direction que produira le
 * clic (calculée par `createSortLinkProps`) ; l'icône reflète le tri courant.
 */
export const SortLink = ({
  href,
  ordre,
  isActive,
  label,
}: {
  href: string
  ordre: SortDirection
  isActive: boolean
  label?: string
}) => {
  const showsAscending = isActive && ordre === 'asc'

  const icon = showsAscending
    ? 'fr-icon-arrow-up-line'
    : 'fr-icon-arrow-down-line'

  const title = label
    ? `Trier par ${label}, ordre ${showsAscending ? 'décroissant' : 'croissant'}`
    : undefined

  return (
    <Link
      className={`fr-btn fr-ml-2v fr-btn--tertiary-no-outline fr-btn--sm ${icon} ${styles.sortLink}`}
      title={title}
      href={href}
      scroll={false}
      style={{ color: isActive ? undefined : 'var(--text-disabled-grey)' }}
    />
  )
}
