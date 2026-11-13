import type { SortDirection } from '@arckit/resultset'
import classNames from 'classnames'
import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Bouton-lien de tri d'une colonne. `ordre` est la direction que produira le
 * clic (calculée par `createSortLinkProps`) ; l'icône reflète le tri courant.
 */
export const SortLink = ({
  href,
  ordre,
  isActive,
  label,
  children,
}: {
  href: string
  ordre: SortDirection
  isActive: boolean
  label?: string
  children?: ReactNode
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
      className={classNames('lien-de-tri', {
        'lien-de-tri--inactif': !isActive,
      })}
      title={title}
      href={href}
      scroll={false}
    >
      {children}
      <span
        className={classNames('lien-de-tri__fleche', icon, 'fr-icon--sm')}
        aria-hidden="true"
      />
    </Link>
  )
}
