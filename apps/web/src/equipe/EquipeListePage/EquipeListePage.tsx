import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import EquipeVide from '@app/web/app/coop/EquipeVide'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { contentId } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import { Exporter } from './actions/Exporter'
import { EquipeDataTable } from './EquipeDataTable'
import { FiltresEquipe } from './filtres/FiltresEquipe'
import { MonEquipePageData } from './getEquipePageData'
import LeaveTeamButton from './LeaveTeamButton'
import type { RoleFiltre } from './searchMediateursCoordonneBy'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const EquipeListePage = ({
  mediateurs,
  searchParams,
  totalPages,
  baseHref,
  baseHrefSearch,
  departementCode,
  coordinateur: {
    id: coordinateurId,
    user: { name, email, phone },
  },
  coordinateurView = true,
  stats: { total, totalAncien, actifs, inactifs, invitations, archives },
}: MonEquipePageData & {
  searchParams: {
    lignes?: string
    page?: string
    recherche?: string
    statut?: string
    role?: RoleFiltre
  }
  totalPages: number
  baseHref: string
  baseHrefSearch: string
  departementCode: string
  coordinateur: {
    id: string
    user: { name: string | null; email: string | null; phone: string | null }
  }
  coordinateurView?: boolean
}) => {
  const mediateursWithDepartement = mediateurs.map((mediateur) => ({
    ...mediateur,
    departementCode,
  }))

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
            {coordinateurView ? (
              <span>
                <Button
                  linkProps={{
                    href: `${baseHref}/inviter`,
                  }}
                  iconId="fr-icon-user-add-line"
                >
                  Inviter une personne
                </Button>
              </span>
            ) : (
              <span>
                <LeaveTeamButton coordinateurId={coordinateurId} />
              </span>
            )}
          </div>
          <div>
            Équipe coordonnée par <span className="fr-text--bold">{name}</span>
            <div className="fr-flex fr-text-mention--grey fr-text--sm fr-mt-2v fr-mb-0 fr-flex-gap-2v">
              <span>
                <span className="ri-mail-line fr-mr-2v" aria-hidden />
                {email}
              </span>
              {phone && (
                <>
                  <span className="fr-hidden fr-unhidden-md" aria-hidden>
                    ·
                  </span>
                  <span>
                    <span className="ri-phone-line fr-mr-2v" aria-hidden />
                    {phone}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="fr-my-4v fr-flex fr-flex-gap-4v fr-justify-content-space-between fr-align-items-center">
            <DataSearchBar
              className="fr-flex-grow-1"
              baseHref={baseHrefSearch}
              searchParams={searchParams}
              placeholder="Rechercher par nom ou adresse e-mail"
            />
            <div className="fr-flex-grow-2 fr-text--right">
              <Exporter
                coordinateurId={coordinateurId}
                searchParams={searchParams}
              />
            </div>
          </div>
          <hr className="fr-separator-4v" />
          <FiltresEquipe
            actifs={actifs}
            inactifs={inactifs}
            invitations={invitations}
            archives={archives}
            defaultRole={searchParams.role}
          />
          {total === 0 &&
          totalAncien === 0 &&
          mediateursWithDepartement?.length === 0 ? (
            <EquipeVide />
          ) : (
            <DataTable
              className="fr-table--nowrap fr-width-full"
              rows={mediateursWithDepartement}
              configuration={EquipeDataTable(coordinateurView)}
              searchParams={searchParams}
              baseHref={baseHrefSearch}
            />
          )}
          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            defaultPageSize={DEFAULT_PAGE_SIZE}
            pageSizeOptions={pageSizeOptions}
            totalPages={totalPages}
            baseHref={baseHrefSearch}
            searchParams={searchParams}
          />
        </main>
      </div>
    </>
  )
}

export default EquipeListePage
