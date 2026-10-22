import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import DataTable from '@app/web/libs/data-table/DataTable'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import type { ReactNode } from 'react'
import { criteresEquipe, type LigneEquipe } from '../../../../domain'
import type { MembresDeLEquipe } from '../../domain'
import { lignesAffichees } from '../lister-les-membres.presenter'
import type { ParametresDeLaListe } from '../pages/EquipeListePage'
import { EquipeDataTable } from './EquipeDataTable'
import EquipeVide from './EquipeVide'
import { FiltresEquipe } from './filtres/FiltresEquipe'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export const ListeDeLEquipe = ({
  membres: { lignes, statistiques, nombreDePages, coordinateur },
  searchParams,
  baseHref,
  exporter,
  actions,
}: {
  membres: MembresDeLEquipe
  searchParams: ParametresDeLaListe
  baseHref: string
  exporter: ReactNode
  actions: ((ligne: LigneEquipe) => ReactNode) | null
}) => {
  const rows = lignesAffichees(lignes, coordinateur.departementCode)

  return (
    <>
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
        defaultRole={criteresEquipe(searchParams).role ?? undefined}
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
    </>
  )
}
