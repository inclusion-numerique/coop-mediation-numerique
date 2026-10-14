import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import type { LigneEquipe } from '../../../../domain'
import type { MembresDeLEquipe } from '../../implementation'
import { EquipeDataTable } from '../components/EquipeDataTable'
import EquipeVide from '../components/EquipeVide'
import { FiltresEquipe } from '../components/filtres/FiltresEquipe'
import type { RoleFiltre } from '../components/filtres/valeurs-de-filtre'
import { lignesAffichees } from '../lister-les-membres.presenter'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export type ParametresDeLaListe = {
  lignes?: string
  page?: string
  recherche?: string
  statut?: string
  role?: RoleFiltre
}

const EquipeListePage = ({
  membres: { lignes, statistiques, nombreDePages, coordinateur },
  searchParams,
  baseHref,
  enTete,
  exporter,
  actions,
}: {
  membres: MembresDeLEquipe
  searchParams: ParametresDeLaListe
  baseHref: string
  enTete: ReactNode
  exporter: ReactNode
  actions: ((ligne: LigneEquipe) => ReactNode) | null
}) => {
  const rows = lignesAffichees(lignes, coordinateur.departementCode)

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--1200">
        <CoopBreadcrumbs currentPage="Mon équipe" />
        <main id={contentId} className="fr-mb-16w">
          <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mt-12v fr-mb-6v">
            <span className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v">
              <span
                className="ri-team-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
                aria-hidden
              />
              <h1 className="fr-page-title fr-m-0">Mon équipe</h1>
            </span>
            <span>{enTete}</span>
          </div>
          <div>
            Équipe coordonnée par{' '}
            <span className="fr-text--bold">{coordinateur.nom}</span>
            <div className="fr-flex fr-text-mention--grey fr-text--sm fr-mt-2v fr-mb-0 fr-flex-gap-2v">
              <span>
                <span className="ri-mail-line fr-mr-2v" aria-hidden />
                {coordinateur.email}
              </span>
              {coordinateur.telephone && (
                <>
                  <span className="fr-hidden fr-unhidden-md" aria-hidden>
                    ·
                  </span>
                  <span>
                    <span className="ri-phone-line fr-mr-2v" aria-hidden />
                    {coordinateur.telephone}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="fr-my-4v fr-flex fr-flex-gap-4v fr-justify-content-space-between fr-align-items-center">
            <DataSearchBar
              className="fr-flex-grow-1"
              baseHref={baseHref}
              searchParams={searchParams}
              placeholder="Rechercher par nom ou adresse e-mail"
            />
            <div className="fr-flex-grow-2 fr-text--right">{exporter}</div>
          </div>
          <hr className="fr-separator-4v" />
          <FiltresEquipe
            actifs={statistiques.actifs}
            inactifs={statistiques.inactifs}
            invitations={statistiques.invitations}
            archives={statistiques.archives}
            defaultRole={searchParams.role}
          />
          {statistiques.total === 0 &&
          statistiques.archives === 0 &&
          rows.length === 0 ? (
            <EquipeVide />
          ) : (
            <DataTable
              className="fr-table--nowrap fr-width-full"
              rows={[...rows]}
              configuration={EquipeDataTable(actions)}
              searchParams={searchParams}
              baseHref={baseHref}
            />
          )}
          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            defaultPageSize={DEFAULT_PAGE_SIZE}
            pageSizeOptions={pageSizeOptions}
            totalPages={nombreDePages}
            baseHref={baseHref}
            searchParams={searchParams}
          />
        </main>
      </div>
    </>
  )
}

export default EquipeListePage
