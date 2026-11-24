import classNames from 'classnames'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { routeConstruite } from '@/libraries/nextjs/route/route-construite'
import type { LiensDePagination } from '../definition/composition'

const VersUnePage = ({
  href,
  className,
  children,
}: {
  href: string | null
  className: string
  children: ReactNode
}) => (
  <li>
    {href === null ? (
      <a className={className} aria-disabled="true">
        {children}
      </a>
    ) : (
      <Link
        className={className}
        role="link"
        href={routeConstruite(href)}
        prefetch={false}
      >
        {children}
      </Link>
    )}
  </li>
)

export const NavigationDePages = ({
  liens: { pages, premiere, precedente, suivante, derniere },
  className,
}: {
  liens: LiensDePagination
  className?: string
}) => (
  <nav
    role="navigation"
    aria-label="Pagination"
    className={classNames('fr-pagination fr-flex', className)}
  >
    <ul className="fr-pagination__list">
      <VersUnePage
        href={premiere}
        className="fr-pagination__link fr-pagination__link--first"
      >
        Première page
      </VersUnePage>
      <VersUnePage
        href={precedente}
        className="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
      >
        Précédent
      </VersUnePage>
      {pages.map((page) =>
        'ellipse' in page ? (
          <li key={page.ellipse}>
            <a className="fr-pagination__link">...</a>
          </li>
        ) : (
          <li key={page.numero}>
            <Link
              className="fr-pagination__link"
              aria-current={page.courante ? 'page' : undefined}
              title={`Page ${page.numero}`}
              href={routeConstruite(page.href)}
              prefetch={false}
            >
              {page.numero}
            </Link>
          </li>
        ),
      )}
      <VersUnePage
        href={suivante}
        className="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
      >
        Suivant
      </VersUnePage>
      <VersUnePage
        href={derniere}
        className="fr-pagination__link fr-pagination__link--last"
      >
        Dernière page
      </VersUnePage>
    </ul>
  </nav>
)
