import classNames from 'classnames'
import Link from 'next/link'
import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

export type SortLinkProps = {
  ordre: SortDirection
  isActive?: boolean
  accessibilityTitle?: string
  href: string
  children?: ReactNode
}

const SortLink = ({
  ordre,
  isActive,
  accessibilityTitle,
  href,
  children,
}: SortLinkProps) => {
  const isDesc = ordre === 'desc'
  const isAsc = !isDesc

  const icon =
    isActive && isAsc ? 'fr-icon-arrow-up-line' : 'fr-icon-arrow-down-line'

  const title = accessibilityTitle
    ? `Trier par ${accessibilityTitle}, ordre ${
        isActive && isAsc ? 'décroissant' : 'croissant'
      }`
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

export default SortLink
