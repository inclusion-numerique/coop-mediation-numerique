'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import {
  BeneficiairesDataTable,
  type BeneficiairesDataTableConfiguration,
  type BeneficiairesDataTableSearchParams,
} from '@app/web/beneficiaire/BeneficiairesDataTable'
import type { BeneficiaireForList } from '@app/web/beneficiaire/queryBeneficiairesForList'
import type { SearchBeneficiaireResult } from '@app/web/beneficiaire/searchBeneficiaires'
import { createSortLinkProps } from '@app/web/libs/data-table/createSortLinkProps'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortLink from '@app/web/libs/data-table/SortLink'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
import { useMemo, useState } from 'react'
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

  const allVisibleSelected = useMemo(
    () =>
      beneficiaires.length > 0 &&
      beneficiaires.every((b) => selectedIds.has(b.id)),
    [beneficiaires, selectedIds],
  )

  const someSelected = useMemo(
    () => beneficiaires.some((b) => selectedIds.has(b.id)),
    [beneficiaires, selectedIds],
  )

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(beneficiaires.map((b) => b.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const clearSelection = () => setSelectedIds(new Set())

  const selectedCount = selectedIds.size
  const hasSelection = selectedCount > 0

  const sortLinkProps = (
    sortParams: BeneficiairesDataTableSearchParams,
    isDefault = false,
    defaultSortableDirection?: 'asc' | 'desc',
  ) =>
    createSortLinkProps({
      searchParams,
      sortParams,
      isDefault,
      defaultSortableDirection,
      baseHref,
    })

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

      <div
        className="fr-table fr-table--nowrap fr-width-full fr-mb-8v"
        data-fr-js-table="true"
      >
        <div className="fr-table__wrapper">
          <div className="fr-table__container">
            <div className="fr-table__content">
              <table
                className={tableStyles.table}
                data-fr-js-table-element="true"
              >
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="fr-checkbox-group fr-checkbox-group--sm fr-pb-6v"
                      style={{ width: 20 }}
                    >
                      <input
                        type="checkbox"
                        id="select-all-beneficiaires"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate =
                              someSelected && !allVisibleSelected
                          }
                        }}
                      />
                      <label
                        className="fr-label"
                        htmlFor="select-all-beneficiaires"
                      >
                        <span className="fr-sr-only">Tout sélectionner</span>
                      </label>
                    </th>
                    {(
                      BeneficiairesDataTable.columns as BeneficiairesDataTableConfiguration['columns']
                    )
                      .filter(({ header }) => header != null)
                      .map((column) => (
                        <th
                          scope="col"
                          key={column.name}
                          className={classNames(column.headerClassName)}
                        >
                          {column.header}
                          {(!!column.defaultSortable ||
                            !!column.sortable ||
                            !!column.sortInMemory ||
                            !!column.orderBy) && (
                            <SortLink
                              {...sortLinkProps(
                                {
                                  tri: column.name,
                                } as unknown as BeneficiairesDataTableSearchParams,
                                column.defaultSortable,
                                column.defaultSortableDirection,
                              )}
                            />
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {beneficiaires.map((row) => {
                    const rowLink = BeneficiairesDataTable.rowLink?.(row)
                    const isSelected = selectedIds.has(row.id)
                    const checkboxId = `select-beneficiaire-${row.id}`

                    return (
                      <tr
                        key={row.id}
                        className={classNames(!!rowLink && 'fr-enlarge-link')}
                      >
                        <td
                          className="fr-checkbox-group fr-checkbox-group--sm fr-pb-8v"
                          style={{ width: 20 }}
                        >
                          <input
                            type="checkbox"
                            id={checkboxId}
                            checked={isSelected}
                            onChange={() => toggleSelect(row.id)}
                          />
                          <label className="fr-label" htmlFor={checkboxId}>
                            <span className="fr-sr-only">
                              Sélectionner {row.prenom} {row.nom}
                            </span>
                          </label>
                        </td>
                        {(
                          BeneficiairesDataTable.columns as BeneficiairesDataTableConfiguration['columns']
                        ).map((column) => {
                          if (!column.cell) {
                            return null
                          }
                          const Component = column.cellAsTh ? 'th' : 'td'

                          return (
                            <Component
                              className={classNames(column.cellClassName)}
                              key={column.name}
                            >
                              {column.cell(row as BeneficiaireForList)}
                            </Component>
                          )
                        })}
                        {!!rowLink && (
                          <td style={{ display: 'none' }}>
                            <Link {...rowLink} />
                          </td>
                        )}
                      </tr>
                    )
                  })}
                  {beneficiaires.length === 0 && (
                    <tr>
                      <td colSpan={BeneficiairesDataTable.columns.length + 1}>
                        Aucun résultat
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <PaginationNavWithPageSizeSelect
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={pageSizeOptions}
        totalPages={totalPages}
        baseHref={baseHref}
        searchParams={searchParams}
      />

      <DeleteBulkBeneficiairesModalContent
        selectedIds={Array.from(selectedIds)}
        onSuccess={clearSelection}
      />
    </>
  )
}

export default SelectableBeneficiairesTable
