'use client'

import {
  type DataTableUrlState,
  useDataTableSelection,
} from '@app/web/libraries/data-table'
import { BeneficiairesPagination } from './BeneficiairesPagination'
import { BeneficiairesSelectionToolbar } from './BeneficiairesSelectionToolbar'
import { BeneficiairesTable } from './BeneficiairesTable'
import DeleteBulkBeneficiairesModalContent, {
  type SupprimerBeneficiaires,
} from './DeleteBulkBeneficiairesModalContent'
import type { MesBeneficiairesView } from './lister-beneficiaires.presenter'

type ResultsView = Extract<MesBeneficiairesView, { tag: 'results' }>

export const BeneficiairesResults = ({
  view,
  state,
  baseHref,
  supprimerBeneficiaires,
}: {
  view: ResultsView
  state: DataTableUrlState
  baseHref: string
  supprimerBeneficiaires: SupprimerBeneficiaires
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
        state={state}
        baseHref={baseHref}
        selection={selection}
      />
      <BeneficiairesPagination
        state={state}
        baseHref={baseHref}
        totalItems={view.pagination.totalItems}
        pageSize={view.pagination.pageSize}
      />
      <DeleteBulkBeneficiairesModalContent
        selectedIds={[...selection.selectedIds]}
        onSuccess={selection.clear}
        supprimerBeneficiaires={supprimerBeneficiaires}
      />
    </>
  )
}
