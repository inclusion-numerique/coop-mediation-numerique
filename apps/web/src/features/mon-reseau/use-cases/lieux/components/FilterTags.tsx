'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter, useSearchParams } from 'next/navigation'
import type { LieuxFilters } from '../validation/LieuxFilters'
import {
  generateLieuxFiltersLabels,
  toLieuPrefix,
} from './generateLieuxFiltersLabels'

// Query params to keep when clearing filters
const queryParamsToKeep = ['departement']

export const FilterTags = ({
  filters,
  departementsOptions,
  communesOptions,
  mediateursOptions,
}: {
  filters: LieuxFilters
  departementsOptions: SelectOption[]
  communesOptions: SelectOption[]
  mediateursOptions: MediateurOption[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const filterLabelsToDisplay = generateLieuxFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    mediateursOptions,
  }).map(toLieuPrefix)

  const handleRemoveFilter = (key: string, value: string | string[]) => {
    if (Array.isArray(value)) {
      for (const param of value) params.delete(param)
      return router.replace(`?${params}`, { scroll: false })
    }

    const updatedValues = (params.get(key)?.split(',') ?? []).filter(
      (v) => v !== value,
    )

    if (updatedValues.length > 0) {
      params.set(key, updatedValues.join(','))
    } else {
      params.delete(key)
    }

    router.replace(`?${params}`, { scroll: false })
  }

  const handleClearFilters = () => {
    const newQueryParams = new URLSearchParams()
    for (const paramToKeep of queryParamsToKeep) {
      if (searchParams.has(paramToKeep)) {
        newQueryParams.set(paramToKeep, searchParams.get(paramToKeep) ?? '')
      }
    }
    router.replace(`?${newQueryParams}`, { scroll: false })
  }

  return filterLabelsToDisplay.length > 0 ? (
    <>
      <hr className="fr-separator-1px" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-list-group">
          {filterLabelsToDisplay.map((filter) => (
            <li
              className="fr-line-height-1 fr-p-0"
              key={`${filter.type}-${filter.key}`}
            >
              <Tag
                className="fr-pr-3v"
                small
                nativeButtonProps={{
                  type: 'button',
                  onClick: () =>
                    handleRemoveFilter(filter.type, filter.key ?? []),
                }}
              >
                <span className="fr-icon-close-line fr-icon--xs" />
                &nbsp;{filter.label}
              </Tag>
            </li>
          ))}
        </ul>
        <div>
          <Button priority="tertiary no outline" onClick={handleClearFilters}>
            <span className="ri-close-circle-line" aria-hidden />
            &nbsp;Effacer&nbsp;les&nbsp;filtres
          </Button>
        </div>
      </div>
    </>
  ) : null
}
