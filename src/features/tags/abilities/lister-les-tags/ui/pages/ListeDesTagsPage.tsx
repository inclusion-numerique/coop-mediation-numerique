import type { ReactNode } from 'react'
import type { LiensDePagination } from '@/libraries/etat-d-url'
import { PiedDeListe } from '@/libraries/etat-d-url/liste'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { CoopBreadcrumbs } from '@/libraries/ui/components'
import { LigneDuTag } from '../../../../ui/components/LigneDuTag'
import { TriDesTags } from '../components/TriDesTags'
import { paginationDesTags } from '../filtres/liste-des-tags.filtre'
import type { LigneDeLaListe } from '../presenters/liste-des-tags.presenter'

export const ListeDesTagsPage = ({
  lignes,
  total,
  pages,
  estCoordinateur,
  creer,
  modales,
  actions,
}: {
  lignes: readonly LigneDeLaListe[]
  total: number
  pages: LiensDePagination
  estCoordinateur: boolean
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
          <TriDesTags />
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
        <PiedDeListe
          className="fr-mt-12v"
          liens={pages}
          pagination={paginationDesTags}
        />
      </main>
    </div>
  </>
)
