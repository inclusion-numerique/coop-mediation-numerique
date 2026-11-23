import type { ReactNode } from 'react'
import {
  DEFAULT_PAGE_SIZE,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import SortSelect from '@/libraries/data-table/sort/SortSelect'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import { LigneDuTag } from '../../../../ui'
import type { LigneDeLaListe } from '../liste-des-tags.presenter'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export type ParametresDeLaListe = {
  lignes?: string
  page?: string
  tri?: string
}

export const ListeDesTagsPage = ({
  lignes,
  total,
  lignesParPage,
  estCoordinateur,
  baseHref,
  searchParams,
  creer,
  modales,
  actions,
}: {
  lignes: readonly LigneDeLaListe[]
  total: number
  lignesParPage: number
  estCoordinateur: boolean
  baseHref: string
  searchParams: ParametresDeLaListe
  creer: ReactNode
  modales: ReactNode
  actions: (ligne: LigneDeLaListe) => ReactNode
}) => (
  <>
    <SkipLinksPortal />
    <div className="fr-container fr-container--800 fr-pb-16w">
      <CoopBreadcrumbs currentPage="Mes tags" />
      {modales}
      <main id={contentId}>
        <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-mt-12v">
          <span
            className="ri-price-tag-3-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
            aria-hidden
          />
          <h1 className="fr-page-title fr-m-0">Mes Tags</h1>
          <div className="fr-ml-auto">{creer}</div>
        </div>
        <p className="fr-text--sm fr-mt-6v fr-mb-12v">
          {estCoordinateur ? (
            <>
              Utilisez les tags pour permettre à votre équipe de lier des
              comptes rendus d’activités à des thématiques
              spécifiques&nbsp;/&nbsp; dispositifs locaux que vous avez besoin
              de suivre dans vos statistiques.
            </>
          ) : (
            <>
              Utilisez les tags pour lier vos comptes rendus d’activité à des
              thématiques spécifiques / dispositifs locaux que vous avez besoin
              de suivre dans vos statistiques.
            </>
          )}{' '}
          <a
            className="fr-link fr-link--sm"
            href="https://docs.numerique.gouv.fr/docs/dcade515-17b9-4298-a2e5-bdf3ed22bf96/"
            target="_blank"
            rel="noreferrer"
          >
            En savoir plus
          </a>
        </p>
        <div className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-4v fr-justify-content-space-between fr-mb-8v">
          <h2 className="fr-h6 fr-mb-0">{total} Tags</h2>
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
          {lignes.map((ligne) => (
            <li key={ligne.tag.id} className="fr-border--bottom fr-py-5v">
              <LigneDuTag
                tag={ligne.tag}
                accompagnements={ligne.accompagnements}
                actions={ligne.gerable ? actions(ligne) : null}
              />
            </li>
          ))}
        </ul>
        <PaginationNavWithPageSizeSelect
          className="fr-mt-12v"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          pageSizeOptions={pageSizeOptions}
          itemsCount={total}
          pageSize={lignesParPage}
          baseHref={baseHref}
          state={searchParams}
        />
      </main>
    </div>
  </>
)
