import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import React from 'react'
import CreateTag from '../create/CreateTag'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export const ListTagsPage = ({
  isMediateur,
  isCoordinateur,
  tags,
  matchesCount,
  totalPages,
  baseHref,
  searchParams,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
  tags: { nom: string; scope: string; description?: string }[]
  matchesCount: number
  totalPages: number
  baseHref: string
  searchParams: { lignes?: string; page?: string; recherche?: string }
}) => (
  <>
    <SkipLinksPortal links={defaultSkipLinks} />
    <div className="fr-container fr-container--800 fr-pb-16w">
      <CoopBreadcrumbs currentPage="Mes tags" />
      <main id={contentId}>
        <div className="fr-flex fr-direction-column fr-direction-md-row fr-align-items-md-center fr-flex-gap-4v fr-mt-8v fr-mb-12v">
          <div className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-4v">
            <div>
              <span
                className="ri-price-tag-3-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
                aria-hidden
              />
            </div>
            <div>
              <h1 className="fr-page-title fr-m-0 fr-h2">Mes Tags</h1>
              <p className="fr-text--sm fr-mb-0">
                Utilisez les tags pour lier vos comptes rendus d’activité à des
                thématiques spécifiques / dispositifs locaux que vous avez
                besoin de suivre dans vos statistiques. En savoir plus
              </p>
            </div>
          </div>
          <CreateTag
            isMediateur={isMediateur}
            isCoordinateur={isCoordinateur}
          />
        </div>
        <div className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-4v fr-justify-content-space-between fr-mb-8v">
          <h2 className="fr-h6 fr-mb-0">{matchesCount} Tags</h2>
          <SortSelect
            options={[
              { label: 'Ordre alphabétique', value: 'alphabetique' },
              { label: 'Visibilité', value: 'visibilite' },
            ]}
            baseHref={baseHref}
          />
        </div>
        <hr className="fr-separator-1px" />
        <ul className="fr-raw-list">
          {tags.map((tag, index) => (
            <li
              key={index}
              className="fr-border--bottom fr-py-5v fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v"
            >
              <div>
                <span className="fr-text--bold">{tag.nom}</span>
                {tag.description && (
                  <p className="fr-mb-0 fr-text--sm fr-text-mention--grey">
                    {tag.description}
                  </p>
                )}
              </div>
              <div>
                <Badge
                  className={classNames(
                    'fr-text--nowrap',
                    tag.scope === 'personnel'
                      ? 'fr-text-mention--grey'
                      : undefined,
                  )}
                  severity={tag.scope === 'personnel' ? undefined : 'info'}
                  noIcon
                >
                  Tag {tag.scope}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
        <PaginationNavWithPageSizeSelect
          className="fr-mt-12v"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          pageSizeOptions={pageSizeOptions}
          totalPages={totalPages}
          baseHref={baseHref}
          searchParams={searchParams}
        />
      </main>
    </div>
  </>
)
