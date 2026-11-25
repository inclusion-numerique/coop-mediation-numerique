'use client'

import { useDataTableSelection } from '@/libraries/data-table/selection'
import { PiedDeListe } from '@/libraries/etat-d-url/liste'
import {
  type LiensDeLaListe,
  paginationDesBeneficiaires,
} from '../filtres/liste-des-beneficiaires.filtre'
import type { VueDeMesBeneficiaires } from '../presenters/lister-beneficiaires.presenter'
import { BeneficiairesSelectionToolbar } from './BeneficiairesSelectionToolbar'
import { BeneficiairesTable } from './BeneficiairesTable'
import DeleteBulkBeneficiairesModalContent from './DeleteBulkBeneficiairesModalContent'

type ResultsView = Extract<VueDeMesBeneficiaires, { tag: 'results' }>

export const BeneficiairesResults = ({
  view,
  liens,
}: {
  view: ResultsView
  liens: LiensDeLaListe
}) => {
  const selection = useDataTableSelection(view.rows.map((row) => row.id))

  return (
    <>
      <BeneficiairesSelectionToolbar
        totalItems={view.pagination.totalItems}
        selectedCount={selection.selectedIds.size}
      />
      <BeneficiairesTable
        rows={view.rows}
        colonnes={liens.colonnes}
        selection={selection}
      />
      <PiedDeListe
        liens={liens.pages}
        pagination={paginationDesBeneficiaires}
      />
      <DeleteBulkBeneficiairesModalContent
        selectedIds={[...selection.selectedIds]}
        onSuccess={selection.clear}
      />
    </>
  )
}
