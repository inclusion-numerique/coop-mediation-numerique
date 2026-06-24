import classNames from 'classnames'
import Link from 'next/link'
import type { DataTableUrlState } from '../data-table-url-state'
import { createDataTableHref } from '../href/create-data-table-href'
import { paginate } from './paginate'

export type PaginationNavProps = {
  className?: string
  baseHref: string
  state: DataTableUrlState
  itemsCount: number
  pageSize: number
}

export const PaginationNav = ({
  className,
  baseHref,
  state,
  itemsCount,
  pageSize,
}: PaginationNavProps) => {
  const currentPage = state.page ? Number.parseInt(state.page, 10) : 1

  const { pages, lastPage, previousPage, nextPage } = paginate({
    itemsCount,
    pageSize,
    currentPage,
    boundaryCount: 1,
  })

  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= lastPage

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
              href={pageHref(previousPage)}
              prefetch={false}
            >
              Précédent
            </Link>
          )}
        </li>
        {pages.map((page) =>
          'spacer' in page ? (
            <li key={page.spacer}>
              <a className="fr-pagination__link">...</a>
            </li>
          ) : (
            <li key={page.number}>
              <Link
                className="fr-pagination__link"
                aria-current={page.isCurrent ? 'page' : undefined}
                title={`Page ${page.number}`}
                href={pageHref(page.number)}
                prefetch={false}
              >
                {page.number}
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
              href={pageHref(nextPage)}
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
              href={pageHref(lastPage)}
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
