import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { CoordinationEmptyState } from '../../../../ui/CoordinationEmptyState'
import type { ListeDesCoordinations } from '../liste-des-coordinations.presenter'
import { CarteDeCoordination } from './CarteDeCoordination'
import { DetailDeCoordinationModale } from './DetailDeCoordinationModale'

const optionsDeLignes = generatePageSizeSelectOptions([10, 20, 50, 100])

export const ActivitesDeCoordinationListe = ({
  liste: { titre, jours, pages },
  filtre,
  pagination,
}: {
  liste: ListeDesCoordinations
  filtre: boolean
  pagination: { page?: string; lignes?: string }
}) =>
  jours.length === 0 ? (
    <CoordinationEmptyState isFiltered={filtre} />
  ) : (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full fr-my-6v">
        <h2 className="fr-text--bold fr-text--lg fr-mb-0">{titre}</h2>
      </div>
      <DetailDeCoordinationModale />
      {jours.map(({ cle, jour, cartes }) => (
        <div key={cle} className="fr-mb-8v">
          <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
            {jour}
          </h3>
          {cartes.map((carte) => (
            <CarteDeCoordination key={carte.id} carte={carte} />
          ))}
        </div>
      ))}
      <PaginationNavWithPageSizeSelect
        className="fr-mt-12v"
        totalPages={pages}
        baseHref="/coop/mes-coordinations"
        searchParams={pagination}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={optionsDeLignes}
      />
    </div>
  )
