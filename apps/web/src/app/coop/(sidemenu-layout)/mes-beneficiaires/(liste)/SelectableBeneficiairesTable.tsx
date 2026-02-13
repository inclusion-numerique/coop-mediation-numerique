'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import {
  BeneficiairesDataTable,
  type BeneficiairesDataTableSearchParams,
} from '@app/web/beneficiaire/BeneficiairesDataTable'
import type { SearchBeneficiaireResult } from '@app/web/beneficiaire/searchBeneficiaires'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SelectableDataTable from '@app/web/libs/data-table/SelectableDataTable'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'
import { DeleteBulkBeneficiairesModal } from './DeleteBulkBeneficiairesModal'
import DeleteBulkBeneficiairesModalContent from './DeleteBulkBeneficiairesModalContent'
import { getBeneficiairesResultCountLabel } from './getBeneficiairesResultCountLabel'
import tableStyles from './MesBeneficiairesListePage.module.css'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const SelectableBeneficiairesTable = ({
  data: { beneficiaires, totalPages, matchesCount },
  searchParams,
  baseHref,
  isFiltered,
}: {
  data: SearchBeneficiaireResult
  searchParams: BeneficiairesDataTableSearchParams
  baseHref: string
  isFiltered: boolean
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const selectedCount = selectedIds.size
  const hasSelection = selectedCount > 0

  return (
    <>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-5v">
        <p className="fr-mb-0 fr-py-2v">
          <span className="fr-text--bold fr-text--lg">
            {getBeneficiairesResultCountLabel({
              isFiltered,
              searchResult: { matchesCount },
            })}
          </span>
          {hasSelection && (
            <span className="fr-text-mention--grey fr-text--sm fr-text--semi-bold">
              {' '}
              · {selectedCount} bénéficiaire{sPluriel(selectedCount)}{' '}
              sélectionné{sPluriel(selectedCount)}
            </span>
          )}
        </p>
        {hasSelection && (
          <Button
            priority="tertiary"
            iconId="fr-icon-delete-line"
            iconPosition="right"
            onClick={() => DeleteBulkBeneficiairesModal.open()}
          >
            Supprimer
          </Button>
        )}
      </div>

      <SelectableDataTable
        className="fr-table--nowrap fr-width-full fr-mb-8v"
        rows={beneficiaires}
        configuration={BeneficiairesDataTable}
        searchParams={searchParams}
        baseHref={baseHref}
        classes={{ table: tableStyles.table }}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowLabel={(row) => `${row.prenom} ${row.nom}`}
      />

      <PaginationNavWithPageSizeSelect
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={pageSizeOptions}
        totalPages={totalPages}
        baseHref={baseHref}
        searchParams={searchParams}
      />

      <DeleteBulkBeneficiairesModalContent
        selectedIds={Array.from(selectedIds)}
        onSuccess={() => setSelectedIds(new Set())}
      />
    </>
  )
}

export default SelectableBeneficiairesTable
