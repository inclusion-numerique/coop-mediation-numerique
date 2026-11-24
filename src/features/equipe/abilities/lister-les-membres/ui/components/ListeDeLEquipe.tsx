import type { ReactNode } from 'react'
import {
  DataSearchBar,
  DEFAULT_PAGE_SIZE,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import { BarreDeFiltres } from '@/libraries/filtres/BarreDeFiltres'
import type { LigneEquipe } from '../../../../domain'
import { filtresDeLEquipe } from '../../../../ui/filtres/equipe.filtre'
import type { MembresDeLEquipe } from '../../domain'
import { lignesAffichees } from '../presenters/lister-les-membres.presenter'
import { etatDeLaListe } from '../search-params/etat-de-la-liste.search-params'
import type { ParametresDeLaListe } from '../search-params/parametres-de-la-liste.search-params'
import { EquipeTable } from './EquipeTable'
import EquipeVide from './EquipeVide'
import { FiltresDeLEquipe } from './filtres/FiltresDeLEquipe'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

export const ListeDeLEquipe = ({
  membres: {
    lignes,
    statistiques,
    nombreDeResultats,
    lignesParPage,
    coordinateur,
  },
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
  const state = etatDeLaListe(searchParams)
  const adresse = { chemin: baseHref, parametres: searchParams }

  return (
    <>
      <div className="fr-my-4v fr-flex fr-flex-gap-4v fr-justify-content-space-between fr-align-items-center">
        <DataSearchBar
          className="fr-flex-grow-1"
          baseHref={baseHref}
          state={state}
          placeholder="Rechercher par nom ou adresse e-mail"
        />
        <div className="fr-flex-grow-2 fr-text--right">{exporter}</div>
      </div>
      <hr className="fr-separator-4v" />
      <BarreDeFiltres
        etiquettes={filtresDeLEquipe.etiquettes(
          adresse,
          filtresDeLEquipe.charger(searchParams),
        )}
        sansFiltres={filtresDeLEquipe.sansFiltres(adresse)}
      >
        <FiltresDeLEquipe
          actifs={statistiques.actifs}
          inactifs={statistiques.inactifs}
          invitations={statistiques.invitations}
          archives={statistiques.archives}
        />
      </BarreDeFiltres>
      {statistiques.total === 0 &&
      statistiques.archives === 0 &&
      rows.length === 0 ? (
        <EquipeVide />
      ) : (
        <EquipeTable
          lignes={rows}
          state={state}
          baseHref={baseHref}
          actions={actions}
        />
      )}
      <PaginationNavWithPageSizeSelect
        className="fr-mt-12v"
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={pageSizeOptions}
        itemsCount={nombreDeResultats}
        pageSize={lignesParPage}
        baseHref={baseHref}
        state={state}
      />
    </>
  )
}
