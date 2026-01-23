import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import DeleteTagModal from '@app/web/features/activites/use-cases/tags/delete/DeleteTagModal'
import { Equipe } from '@app/web/features/activites/use-cases/tags/equipe'
import SaveTagModal from '@app/web/features/activites/use-cases/tags/save/SaveTagModal'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { contentId } from '@app/web/utils/skipLinks'
import { TagScope } from '../tagScope'
import { CreateTag } from './CreateTag'
import { TagActions } from './TagActions'
import { TagList } from './TagList'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export const ListTagsPage = ({
  isMediateur,
  isCoordinateur,
  equipes,
  tags,
  matchesCount,
  totalPages,
  baseHref,
  searchParams,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
  equipes: Equipe[]
  tags: {
    id: string
    nom: string
    scope: TagScope
    description?: string
    accompagnementsCount: number
    equipeId?: string
  }[]
  matchesCount: number
  totalPages: number
  baseHref: string
  searchParams: { lignes?: string; page?: string; recherche?: string }
}) => (
  <>
    <SkipLinksPortal />
    <div className="fr-container fr-container--medium fr-pb-16w">
      <CoopBreadcrumbs currentPage="Mes tags" />
      <SaveTagModal
        isMediateur={isMediateur}
        isCoordinateur={isCoordinateur}
        equipes={equipes}
      />
      <DeleteTagModal />
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
                {isCoordinateur ? (
                  <>
                    Utilisez les tags pour permettre à votre équipe de lier des
                    comptes rendus d’activités à des thématiques
                    spécifiques&nbsp;/&nbsp; dispositifs locaux que vous avez
                    besoin de suivre dans vos statistiques.
                  </>
                ) : (
                  <>
                    Utilisez les tags pour lier vos comptes rendus d’activité à
                    des thématiques spécifiques / dispositifs locaux que vous
                    avez besoin de suivre dans vos statistiques.
                  </>
                )}{' '}
                <a
                  className="fr-link fr-link--sm"
                  href="https://docs.numerique.gouv.fr/docs/dcade515-17b9-4298-a2e5-bdf3ed22bf96/"
                  target="_blank"
                >
                  En savoir plus
                </a>
              </p>
            </div>
          </div>
          <CreateTag />
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
        <TagList
          tags={tags}
          actions={(tag) => (
            <TagActions isCoordinateur={isCoordinateur} tag={tag} />
          )}
        />
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
