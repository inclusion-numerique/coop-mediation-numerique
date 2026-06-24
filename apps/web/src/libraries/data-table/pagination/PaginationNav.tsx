import classNames from 'classnames'
import Link from 'next/link'
import type { DataTableUrlState } from '../data-table-url-state'
import { createDataTableHref } from '../href/create-data-table-href'
import { createPagesNumbersToDisplay } from './create-pages-numbers-to-display'

export type PaginationNavProps = {
  className?: string
  baseHref: string
  state: DataTableUrlState
  totalPages: number
}

export const PaginationNav = ({
  className,
  baseHref,
  state,
  totalPages,
}: PaginationNavProps) => {
  const pageNumber = state.page ? Number.parseInt(state.page, 10) : 1

  const isFirstPage = pageNumber <= 1
  const isLastPage = pageNumber >= totalPages

  const linkablePages = createPagesNumbersToDisplay(totalPages, pageNumber)

  const pageHref = (page: number) =>
    createDataTableHref(baseHref, { ...state, page: page.toString(10) })

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={classNames('fr-pagination fr-flex', className)}
    >
      <ul className="fr-pagination__list">
        <li>
          {isFirstPage ? (
            <a
              className="fr-pagination__link fr-pagination__link--first"
              aria-disabled="true"
            >
              Première page
            </a>
          ) : (
            <Link
              className="fr-pagination__link fr-pagination__link--first"
              role="link"
              href={pageHref(1)}
              prefetch={false}
            >
              Première page
            </Link>
          )}
        </li>
        <li>
          {isFirstPage ? (
            <a
              className="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
              aria-disabled="true"
            >
              Précédent
            </a>
          ) : (
            <Link
              className="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
              role="link"
              href={pageHref(pageNumber - 1)}
              prefetch={false}
            >
              Précédent
            </Link>
          )}
        </li>
        {linkablePages.map((linkNumber) =>
          typeof linkNumber === 'string' ? (
            <li key={linkNumber}>
              <a className="fr-pagination__link">...</a>
            </li>
          ) : (
            <li key={linkNumber}>
              <Link
                className="fr-pagination__link"
                aria-current={pageNumber === linkNumber ? 'page' : undefined}
                title={`Page ${linkNumber}`}
                href={pageHref(linkNumber)}
                prefetch={false}
              >
                {linkNumber}
              </Link>
            </li>
          ),
        )}
        <li>
          {isLastPage ? (
            <a
              className="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
              aria-disabled="true"
            >
              Suivant
            </a>
          ) : (
            <Link
              className="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
              role="link"
              href={pageHref(pageNumber + 1)}
              prefetch={false}
            >
              Suivant
            </Link>
          )}
        </li>
        <li>
          {isLastPage ? (
            <a
              className="fr-pagination__link fr-pagination__link--last"
              aria-disabled="true"
            >
              Dernière page
            </a>
          ) : (
            <Link
              className="fr-pagination__link fr-pagination__link--last"
              role="link"
              href={pageHref(totalPages)}
              prefetch={false}
            >
              Dernière page
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}
